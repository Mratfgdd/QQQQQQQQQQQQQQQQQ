import React, { useState } from "react";
import { useModel } from "../../../../state/Store";
import { TextureLoader, RepeatWrapping, sRGBEncoding, Color } from "three";
import {
  TextureSelectionWrapper,
  Title,
  SelectionList,
  SelectionItem,
  DoorItem
} from "./style";
import { useTranslation } from "react-i18next";

const onSelectItem = (model, item, type, setSelectedItem) => {
  const { textureImg } = item;
  const loader = new TextureLoader();
  const color = new Color(item.color);

  /* Текстури з адмін-панелі лежать на бекенді (інший origin), тому
     без crossOrigin WebGL відмовиться з них малювати */
  loader.setCrossOrigin("anonymous");

  /* Масштаб плитки задає адміністратор для кожної підлоги окремо;
     4 — те саме значення, що було захардкоджене раніше */
  const tile = Number(item.repeat) > 0 ? Number(item.repeat) : 4;

  if (model) {
    model.traverse((o) => {
      if (o.name.includes(type)) {
        if (type === "Wall") {
          o.material.color = color;
          o.material.map.encoding = sRGBEncoding;
          // o.material.shininess = 6;
        } else if (type === "Door") {
          loader.load(
            textureImg,
            (texture) => {
              texture.repeat.set(4, 4);
              texture.wrapS = RepeatWrapping;
              texture.wrapT = RepeatWrapping;
              texture.flipY = false;
              texture.encoding = sRGBEncoding;
              o.material.map = texture;
              o.material.needsUpdate = true;
            },
            (xhr) => {},
            (error) => {
              console.log(error);
            }
          );
        } else {
          loader.load(
            textureImg,
            (texture) => {
              texture.repeat.set(tile, tile);
              texture.encoding = sRGBEncoding;
              texture.wrapS = RepeatWrapping;
              texture.wrapT = RepeatWrapping;
              o.material.map = texture;
              /* Без needsUpdate three може лишити стару текстуру
                 в кеші матеріалу — саме тому підлога інколи не мінялася */
              o.material.needsUpdate = true;
            },
            (xhr) => {},
            (error) => {
              /* Текстура не завантажилась — сцена лишається з попередньою,
                 нічого не ламається */
              console.warn("Не вдалося завантажити текстуру підлоги", textureImg, error);
            }
          );
        }

        // o.material = floorMaterial;
        // o.material.needsUpdate = true;
      }
    });

    setSelectedItem(item);
  }
};

export default function TextureSelection({
  data,
  type,
  doorSelection = false
}) {
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState({
    id: null
  });

  const model = useModel((state) => state.model);

  // const type = "Floor";

  return (
    <TextureSelectionWrapper isDoorSelection={doorSelection}>
      <Title>{t("accordion:selectedPlaceholder")}:</Title>
      <SelectionList>
        {data.map((item) => {
          const isSelected = selectedItem.id === item.id;

          return (
            <SelectionItem
              onClick={() => onSelectItem(model, item, type, setSelectedItem)}
              isDoorSelection={doorSelection}
              key={item.id}
              className={isSelected ? "is-selected" : null}
              src={item.previewImg || item.textureImg || item.color}
              isColor={item.color}
              title={item.name}
            >
              {isSelected ? (
                <div
                  id='tick-mark'
                  className={doorSelection ? "door" : null}
                ></div>
              ) : null}
              {doorSelection ? (
                <DoorItem>
                  
                </DoorItem>
              ) : null}
            </SelectionItem>
          );
        })}
      </SelectionList>
    </TextureSelectionWrapper>
  );
}
