export const PRODUCTS_DATA = {
    oak: {
      id: 'oak',
      title: 'Паркет Дуб',
      pricePerM2: 3850, // Ціна за м² для дуба
      packSqM: 2.4,     // М² в одній упаковці
      images: [
        '/qqq.jpg',
        '/images/oak-2.jpg',
        '/images/oak-3.jpg',
      ],
      specs: {
        wood: 'Дуб',
        sorting: 'Рустік / Селект',
        coating: 'Олія / Лак',
      },
      description: 'Паркетна дошка з дуба European Nature – це поєднання природної краси та міцності...'
    },
    ash: {
      id: 'ash',
      title: 'Паркет Ясен',
      pricePerM2: 3200, // Ціна за м² для ясена
      packSqM: 2.2,
      images: [
        '/logo2.jpg',
        '/images/ash-2.jpg',
        '/images/ash-3.jpg',
      ],
      specs: {
        wood: 'Ясен',
        sorting: 'Селект',
        coating: 'Олія / Лак',
      },
      description: 'Паркет із ясена має виразну текстуру, світлий відтінок та високу пружність...'
    },
    hornbeam: {
      id: 'hornbeam',
      title: 'Паркет Граб',
      pricePerM2: 3500, // Ціна за м² для граба
      packSqM: 2.0,
      images: [
        '/cat-grab.jpg',
        '/images/hornbeam-2.jpg',
        '/images/hornbeam-3.jpg',
      ],
      specs: {
        wood: 'Граб',
        sorting: 'Селект',
        coating: 'Олія / Лак',
      },
      description: 'Граб – одна з найтвердіших порід деревини з вишуканим світлим візерунком...'
    },

    /* ── ПАРКЕТНА ДОШКА ── */
    'board-oak-natur': {
      id: 'board-oak-natur',
      title: 'Паркетна дошка Дуб Натур',
      pricePerM2: 2890,
      packSqM: 2.13,
      images: ['/parket_dos1.png'],
      specs: {
        wood: 'Дуб',
        sorting: 'Натур',
        coating: 'УФ-лак',
      },
      description: 'Тришарова паркетна дошка з дуба сорту Натур. Стабільна геометрія, замок Click та готове заводське покриття УФ-лаком.'
    },
    'board-oak-rustic': {
      id: 'board-oak-rustic',
      title: 'Паркетна дошка Дуб Рустік',
      pricePerM2: 2450,
      packSqM: 2.13,
      images: ['/parket_dos2.jpg'],
      specs: {
        wood: 'Дуб',
        sorting: 'Рустік',
        coating: 'Олія-віск',
      },
      description: 'Двошарова дошка з вираженою текстурою та сучками. Шпон 4 мм і покриття олія-віск, яке легко оновлюється локально.'
    },
    'board-ash-select': {
      id: 'board-ash-select',
      title: 'Паркетна дошка Ясен Селект',
      pricePerM2: 3150,
      packSqM: 1.98,
      images: ['/parket_dos3.png'],
      specs: {
        wood: 'Ясен',
        sorting: 'Селект',
        coating: 'Матовий лак',
      },
      description: 'Тришарова дошка з ясена сорту Селект: рівний світлий тон, мінімум сучків, матовий лак із природним ефектом.'
    },

    /* ── ЛАМІНАТ ── */
    'laminate-siena': {
      id: 'laminate-siena',
      title: 'Ламінат Дуб Сієна',
      pricePerM2: 890,
      packSqM: 2.22,
      images: ['/lamin1.jpg'],
      specs: {
        wood: 'Декор дуб',
        sorting: 'Клас 33',
        coating: 'Фаска 4V',
      },
      description: 'Ламінат 33 класу товщиною 8 мм із фаскою 4V. Витримує комерційне навантаження та реалістично імітує дубову дошку.'
    },
    'laminate-nord': {
      id: 'laminate-nord',
      title: 'Ламінат Дуб Норд',
      pricePerM2: 790,
      packSqM: 2.22,
      images: ['/lamin2.jpg'],
      specs: {
        wood: 'Декор дуб',
        sorting: 'Клас 32',
        coating: 'Тиснення в реєстр',
      },
      description: 'Ламінат 32 класу зі структурою, синхронізованою з малюнком декору: поверхня на дотик повторює деревні пори.'
    },
    'laminate-milano': {
      id: 'laminate-milano',
      title: 'Ламінат Горіх Мілано',
      pricePerM2: 1150,
      packSqM: 1.86,
      images: ['/lamin3.jpg'],
      specs: {
        wood: 'Декор горіх',
        sorting: 'Клас 33',
        coating: 'AquaStop',
      },
      description: 'Ламінат 10 мм із вологостійким замком AquaStop. Глибокий теплий відтінок горіха, придатний для кухні та коридору.'
    },

    /* ── АКСЕСУАРИ ── */
    'skirting-oak': {
      id: 'skirting-oak',
      title: 'Плінтус дубовий 80 мм',
      pricePerM2: 480,
      packSqM: 2.4,
      images: ['/aks1.png'],
      specs: {
        wood: 'Масив дуба',
        sorting: 'Висота 80 мм',
        coating: 'Лак / Олія',
      },
      description: 'Плінтус із масиву дуба на прихованих кліпсах. Тонується в колір підлоги, монтується без видимого кріплення.'
    },
    'care-oil': {
      id: 'care-oil',
      title: 'Олія-віск для підлоги',
      pricePerM2: 1290,
      packSqM: 25,
      images: ['/aks2.jpg'],
      specs: {
        wood: 'Натуральні олії',
        sorting: "Об'єм 1 л",
        coating: 'Матовий ефект',
      },
      description: "Олія-віск на натуральній основі для догляду та оновлення дерев'яної підлоги. Витрата приблизно 25 м² з літра."
    },
    'underlay-pine': {
      id: 'underlay-pine',
      title: 'Підкладка хвойна 5 мм',
      pricePerM2: 180,
      packSqM: 7,
      images: ['/aks3.jpg'],
      specs: {
        wood: 'Хвойна плита',
        sorting: 'Товщина 5 мм',
        coating: 'Формат 790 × 590 мм',
      },
      description: 'Натуральна хвойна підкладка: вирівнює основу, гасить ударний шум до 21 дБ і тримає тепло.'
    }
  };
