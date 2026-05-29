import React, { useMemo } from "react";
import {
  TextureLoader,
  sRGBEncoding,
  PMREMGenerator,
  DefaultLoadingManager,
  ACESFilmicToneMapping,
  VideoTexture,
  MeshBasicMaterial,
  GammaEncoding,
  RepeatWrapping
} from "three";
import { useLoader, useThree } from "react-three-fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { useModel } from "../state/Store";

export default function Model() {
  const { scene, gl } = useThree();
  const { setModel, setScene, setLightMaps } = useModel((state) => state);
  
  const loader = useMemo(() => {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco-gltf/");
    gltfLoader.setDRACOLoader(dracoLoader);
    return gltfLoader;
  }, []);

  const pmremGenerator = new PMREMGenerator(gl);
  var pngCubeRenderTarget, envMap;
  const video = document.getElementById("video");
  const videoTexture = new VideoTexture(video);
  videoTexture.encoding = GammaEncoding;

  // 1. КАРТИ ТІНЕЙ (Завантажуємо окремо, вони зазвичай стабільні)
  const lightMaps = useLoader(TextureLoader, [
    "/assets/textures/AssalomHall/CoffeeTable3.webp",
    "/assets/textures/AssalomHall/CurtainCarpets3.webp",
    "/assets/textures/AssalomHall/Decor2.webp",
    "/assets/textures/AssalomHall/Exterior7.jpg",
    "/assets/textures/AssalomHall/Frames.webp",
    "/assets/textures/AssalomHall/Furniture2.webp",
    "/assets/textures/AssalomHall/Sofa2.webp",
    "/assets/textures/AssalomHall/Table2.webp",
    "/assets/textures/AssalomHall/TV_Shelf3.webp",
    "/assets/textures/AssalomHall/Empty_Exterior.webp",
    "/assets/textures/AssalomHall/Empty_Furniture.webp",
  ]);

  const [
    CoffeeTableMap, CurtainCarpetsMap, DecorMap, ExteriorMap, FramesMap,
    FurnitureMap, SofaMap, TableMap, TV_ShelfMap, Empty_ExteriorMap, Empty_FurnitureMap
  ] = lightMaps;

  useMemo(() => {
    DefaultLoadingManager.onLoad = () => pmremGenerator.dispose();

    setLightMaps({
      empty: [Empty_ExteriorMap, Empty_FurnitureMap],
      nonEmpty: [ExteriorMap, FurnitureMap],
    });

    setScene(scene);

    // БЕЗПЕЧНЕ ЗАВАНТАЖЕННЯ КОЛЬОРОВИХ ТЕКСТУР
    // Якщо файл не знайдено, Three.js просто не накладе його, але сцена НЕ стане білою!
    const texLoader = new TextureLoader();
    const textures = {};

    const loadSafe = (key, path, repeatX = 1, repeatY = 1) => {
      texLoader.load(
        path,
        (t) => {
          t.flipY = false;
          t.encoding = sRGBEncoding;
          t.wrapS = RepeatWrapping;
          t.wrapT = RepeatWrapping;
          t.repeat.set(repeatX, repeatY);
          textures[key] = t;
          console.log(`Текстура завантажена успішно: ${key}`);
        },
        undefined,
        (err) => console.warn(`Пропущено текстуру (мабуть, немає файлу): ${path}`)
      );
    };

    // Прописуємо точні назви з твоєї папки
    loadSafe("floor", "/assets/textures/floor1.jpg", 4, 4);
    loadSafe("carpet", "/assets/scene_textures/carpet_diffuse_compressed.jpg", 1.5, 1.5);
    loadSafe("wood", "/assets/scene_textures/Table_wood_compressed.jpg", 1, 1);
    loadSafe("pillow", "/assets/scene_textures/Pillow_compressed.jpg", 2, 2);
    loadSafe("mud", "/assets/scene_textures/mud_compressed.jpg", 1, 1);
    loadSafe("gold", "/assets/scene_textures/Gold Art frame.jpg", 1, 1);
    loadSafe("flower", "/assets/scene_textures/Flower_compresed.jpg", 1, 1); // Твоя назва з однією 's'
    loadSafe("coffee_base", "/assets/scene_textures/coffee_base_compressed.jpg", 1, 1);
    loadSafe("fabric_sofa", "/assets/scene_textures/Fabric004_compressed.jpg", 3, 3); // Пробуємо Fabric004, якщо ні — підхопить дефолт
    loadSafe("coffee_table_top", "/assets/textures/AssalomHall/CoffeeTable3.webp", 1, 1);
    // Емвмапа
    texLoader.load("/assets/environment/hall_envMap.webp", (texture) => {
      texture.encoding = sRGBEncoding;
      pngCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      envMap = pngCubeRenderTarget.texture;
      texture.dispose();
    });

    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = 4;
    gl.outputEncoding = sRGBEncoding;
    gl.physicallyCorrectLights = true;

    lightMaps.forEach(t => { if(t) t.flipY = false; });

    // Завантаження самої 3D моделі кімнати
    loader.load(
      "/final2.glb",
      function (gltf) {
        setModel(gltf.scene);
        scene.add(gltf.scene);

        gltf.scene.traverse((o) => {
          if (o.isMesh && o.material) {
            
            o.material.envMap = envMap;
            o.material.envMapIntensity = 0.2;
            o.material.lightMapIntensity = 1.8;

            const nameLower = o.name.toLowerCase();
            const matLower = o.material.name ? o.material.name.toLowerCase() : "";

            // 1. ПІДЛОГА
            if (nameLower.includes("floor") || matLower.includes("floor")) {
              if (textures.floor) o.material.map = textures.floor;
              o.material.lightMap = ExteriorMap;
              o.material.roughness = 0.4;
            } 
            
            // 2. ДИВАН
            else if (nameLower.includes("sofa") || matLower.includes("sofa")) {
              if (textures.fabric_sofa) o.material.map = textures.fabric_sofa;
              o.material.lightMap = SofaMap;
              o.material.roughness = 0.85;
            } 

            // ПОДУШКИ
            else if (nameLower.includes("pillow") || matLower.includes("pillow")) {
              if (textures.pillow) o.material.map = textures.pillow;
              o.material.lightMap = SofaMap;
            }
            
            // 3. ПАЛАС / КИЛИМ
            else if (nameLower.includes("carpet") || matLower.includes("carpet") || nameLower.includes("rug")) {
              if (textures.carpet) o.material.map = textures.carpet;
              o.material.lightMap = CurtainCarpetsMap;
            } 
            
            // 4. СТОЛИ Й СТІЛЬЦІ
            else if (nameLower.includes("table") && !nameLower.includes("coffeetable")) {
              if (textures.wood) o.material.map = textures.wood;
              o.material.lightMap = TableMap;
            } 
            
            // 5. ЖУРНАЛЬНИЙ СТОЛИК
            else if (nameLower.includes("coffeetable") || matLower.includes("coffeetable")) {
              o.material.lightMap = CoffeeTableMap;
              
              if (nameLower.includes("base") || matLower.includes("base")) {
                if (textures.coffee_base) o.material.map = textures.coffee_base;
              } else {
                // Тут ми підставляємо нову текстуру для стільниці столика
                if (textures.coffee_table_top) {
                    o.material.map = textures.coffee_table_top;
                } else if (textures.wood) {
                    o.material.map = textures.wood;
                }
              }
            }
            
            // 6. НОУТБУК
            else if (nameLower.includes("macbook") || nameLower.includes("laptop")) {
              o.material.color.setHex(0x2b2b2b); // Space Gray колір прямо в коді
              o.material.roughness = 0.3;
              o.material.metalness = 0.8;
              o.material.lightMap = CoffeeTableMap;
            }

            // 7. РОСЛИНА / ВАЗОН / ЗЕМЛЯ
            else if (nameLower.includes("flower") || nameLower.includes("plant") || matLower.includes("plant")) {
              if (textures.flower) o.material.map = textures.flower;
              o.material.lightMap = DecorMap;
            } else if (nameLower.includes("mud") || nameLower.includes("dirt") || nameLower.includes("ground")) {
              if (textures.mud) o.material.map = textures.mud;
            }
            
            // 8. РАМКИ
            else if (nameLower.includes("frame") || matLower.includes("frame")) {
              o.material.lightMap = FramesMap;
              if (nameLower.includes("gold") || matLower.includes("gold") || matLower.includes("border")) {
                if (textures.gold) o.material.map = textures.gold;
                o.material.metalness = 0.6;
                o.material.roughness = 0.2;
              }
            } 
            
            // 9. ШТОРИ, СТІНИ, МЕБЛІ
            else if (nameLower.includes("curtain") || matLower.includes("curtain")) {
              o.material.lightMap = CurtainCarpetsMap;
            } else if (nameLower.includes("exterior") || nameLower.includes("wall") || nameLower.includes("ceiling")) {
              o.material.lightMap = ExteriorMap;
            } else if (nameLower.includes("furniture") || nameLower.includes("door")) {
              o.material.lightMap = FurnitureMap;
            } else if (nameLower.includes("tv_shelf")) {
              o.material.lightMap = TV_ShelfMap;
            } else if (nameLower.includes("tv_screen")) {
              o.material = new MeshBasicMaterial({ map: videoTexture });
              videoTexture.flipY = false;
            } else if (nameLower.includes("decor")) {
              o.material.lightMap = DecorMap;
            } else if (nameLower.includes("chandelier") || nameLower.includes("glass") || nameLower.includes("dishes")) {
              o.material.envMapIntensity = 1.0;
              if (matLower.includes("glass")) o.material.refractionRatio = 0;
            }
          }
        });
      },
      undefined,
      function (error) {
        console.error("Помилка моделі:", error);
      }
    );
  }, []);

  return <></>;
}