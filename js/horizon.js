/* Horizon Restaurant Group — identidad de la matriz y las 50 marcas.
   Los id internos se conservan (partidas, logos, carta base). */
(function () {
  const D = BRAND.D;
  const HOLDING = "Horizon Restaurant Group";

  function dishes(list) {
    return list.map((x) => D.apply(null, x));
  }

  const PIZZA = dishes([
    ["Margarita DOC", ["masa", "tomate", "mozzarella", "albahaca"], 1.4, 8.5, "v*"],
    ["Diávola", ["masa", "tomate", "mozzarella", "chorizo", "chile"], 1.7, 9.2, "s"],
    ["Prosciutto", ["masa", "jamon", "mozzarella", "tomate"], 2.2, 10.5, ""],
    ["Cuatro quesos", ["masa", "mozzarella", "parmesano", "queso"], 1.9, 9.8, "v"],
    ["Calzone", ["masa", "ricotta", "jamon", "mozzarella"], 1.8, 9.0, ""],
    ["Focaccia", ["masa", "aceite", "romero"], 0.7, 4.2, "v"],
    ["Tiramisu copa", ["cafe", "queso", "azucar"], 1.1, 5.6, "v"],
    ["Limonada casa", ["limon", "azucar", "agua"], 0.3, 2.8, "v"],
  ]);
  const TACOS = dishes([
    ["Taco asada", ["tortilla", "ternera", "cebolla", "cilantro"], 1.2, 3.8, "s*"],
    ["Taco pollo", ["tortilla", "pollo", "salsa", "lima"], 1.1, 3.5, ""],
    ["Taco pescado", ["tortilla", "bacalao", "repollo", "lima"], 1.4, 4.2, ""],
    ["Quesadilla", ["tortilla", "queso", "chile"], 1.3, 5.4, "v"],
    ["Nachos", ["tortilla", "queso", "chile", "tomate"], 1.4, 5.6, "s"],
    ["Elote", ["maiz", "mayo", "chile", "lima"], 0.7, 3.2, "v"],
    ["Agua horchata", ["leche", "azucar", "canela"], 0.4, 2.4, "v"],
    ["Churros", ["masa", "azucar", "canela"], 0.6, 3.4, "v"],
  ]);
  const MEX = dishes([
    ["Mole poblano", ["pollo", "chile", "chocolate"], 2.4, 11.5, "s*"],
    ["Cochinita", ["cerdo", "naranja", "tortilla"], 2.1, 10.2, ""],
    ["Enchiladas", ["tortilla", "pollo", "salsa", "queso"], 1.8, 9.0, ""],
    ["Pozole", ["cerdo", "maiz", "chile"], 1.9, 8.8, "s"],
    ["Guacamole", ["aguacate", "tomate", "lima"], 1.2, 6.4, "v"],
    ["Taco gobernador", ["tortilla", "gamba", "queso"], 2.0, 9.6, ""],
    ["Flan", ["leche", "huevo", "azucar"], 0.8, 4.5, "v"],
    ["Margarita", ["tequila", "lima", "hielo"], 1.8, 7.8, "a"],
  ]);
  const BURGER_LAB = dishes([
    ["Dry-aged smash", ["pan_burger", "carne_picada", "cheddar"], 2.6, 12.5, "*"],
    ["Wagyu corta", ["pan_burger", "wagyu", "cebolla"], 4.8, 18, ""],
    ["Pollo buttermilk", ["pan_burger", "pollo", "mayo", "lechuga"], 2.2, 11.2, ""],
    ["Portobello", ["pan_burger", "setas", "queso"], 1.8, 9.8, "v"],
    ["Fries trufa", ["patata", "trufa", "parmesano"], 1.4, 6.8, "v"],
    ["Milkshake vainilla", ["leche", "vainilla", "azucar"], 0.8, 4.6, "v"],
    ["Pickles casa", ["pepinillo", "vinagre"], 0.4, 2.8, "v"],
    ["Cerveza craft", ["cerveza"], 1.1, 4.8, "a"],
  ]);
  const WINGS = dishes([
    ["Alitas buffalo", ["pollo", "salsa", "mantequilla"], 1.6, 7.2, "s*"],
    ["Alitas BBQ", ["pollo", "salsa"], 1.6, 7.2, ""],
    ["Alitas miel", ["pollo", "miel", "pimenton"], 1.5, 6.9, ""],
    ["Tenders", ["pollo", "aceite"], 1.4, 6.4, ""],
    ["Loaded fries", ["patata", "cheddar", "bacon"], 1.3, 5.8, ""],
    ["Coleslaw", ["repollo", "mayo"], 0.5, 2.9, "v"],
    ["Ranch dip", ["mayo", "hierbas"], 0.2, 1.2, "v"],
    ["Cubo 20 alitas", ["pollo", "salsa"], 3.8, 14.5, "s"],
  ]);
  const DINER = dishes([
    ["Club sandwich", ["pan", "pollo", "bacon", "lechuga"], 1.8, 8.4, "*"],
    ["Pancakes", ["masa", "huevo", "miel"], 0.9, 6.2, "v"],
    ["Meatloaf", ["carne_picada", "ketchup", "cebolla"], 2.0, 9.5, ""],
    ["Mac & cheese", ["pasta", "cheddar", "leche"], 1.2, 6.8, "v"],
    ["Chili dog", ["pan_hotdog", "cerdo", "carne_picada"], 1.4, 6.5, ""],
    ["Milkshake fresa", ["leche", "azucar", "fruta"], 0.7, 4.2, "v"],
    ["Pie manzana", ["masa", "manzana", "azucar"], 0.9, 4.8, "v"],
    ["Café bottomless", ["cafe"], 0.3, 2.4, "v"],
  ]);
  const STEAK = dishes([
    ["Entrecot 300 g", ["ternera", "sal"], 5.8, 28, "*"],
    ["Solomillo", ["ternera", "mantequilla"], 6.4, 32, ""],
    ["Costilla ahumada", ["costilla", "salsa"], 3.8, 19, ""],
    ["Tartar", ["ternera", "yema", "mostaza"], 3.2, 16, ""],
    ["Patata gratinada", ["patata", "nata", "queso"], 1.1, 6.5, "v"],
    ["Espárragos", ["verdura", "aceite"], 1.4, 7.2, "v"],
    ["Copa reserva", ["vino_tinto"], 2.6, 9.5, "a"],
    ["Soufflé chocolate", ["chocolate", "huevo", "azucar"], 1.4, 8.2, "v"],
  ]);
  const PASTA_FAST = dishes([
    ["Pomodoro", ["pasta", "tomate", "albahaca"], 1.2, 6.4, "v*"],
    ["Carbonara vaso", ["pasta", "huevo", "bacon", "parmesano"], 1.6, 7.8, ""],
    ["Pesto", ["pasta", "albahaca", "parmesano"], 1.4, 7.2, "v"],
    ["Boloñesa", ["pasta", "carne_picada", "tomate"], 1.5, 7.5, ""],
    ["Lasagna copa", ["pasta", "carne_picada", "mozzarella"], 1.8, 8.2, ""],
    ["Ensalada caprese", ["tomate", "mozzarella", "albahaca"], 1.3, 5.9, "v"],
    ["Tiramisú vaso", ["cafe", "queso", "azucar"], 1.0, 4.6, "v"],
    ["Agua & pan", ["agua", "pan"], 0.2, 1.8, "v"],
  ]);
  const HEALTHY = dishes([
    ["Bowl quinoa", ["quinoa", "verdura", "aceite"], 1.6, 8.4, "v*"],
    ["Bowl salmón", ["arroz", "salmon", "aguacate"], 2.4, 11.2, ""],
    ["Ensalada César", ["lechuga", "pollo", "parmesano"], 1.5, 8.0, ""],
    ["Wrap hummus", ["pita", "garbanzo", "verdura"], 1.3, 6.8, "v"],
    ["Sopa miso", ["miso", "tofu", "algas"], 0.7, 4.2, "v"],
    ["Smoothie verde", ["espinaca", "platano", "leche"], 0.9, 4.8, "v"],
    ["Yogur & granola", ["yogurt", "miel", "avena"], 0.8, 4.4, "v"],
    ["Agua infusión", ["agua", "limon", "menta"], 0.15, 2.2, "v"],
  ]);
  const GARDEN = dishes([
    ["Risotto verdura", ["arroz", "verdura", "parmesano"], 1.8, 11.5, "v*"],
    ["Lasagna verdura", ["pasta", "verdura", "ricotta"], 1.7, 10.8, "v"],
    ["Buddha bowl", ["quinoa", "tofu", "aguacate"], 1.6, 9.6, "v"],
    ["Hummus & pita", ["garbanzo", "tahini", "pita"], 1.1, 6.4, "v"],
    ["Ensalada cítrica", ["naranja", "hinojo", "aceite"], 1.2, 7.2, "v"],
    ["Sopa calabaza", ["calabaza", "nata"], 0.9, 5.8, "v"],
    ["Tarta queso", ["queso", "azucar", "galleta"], 1.0, 5.4, "v"],
    ["Kombucha", ["te", "azucar"], 0.6, 3.8, "v"],
  ]);
  const BAKERY = dishes([
    ["Croissant mantequilla", ["croissant", "mantequilla"], 0.6, 3.4, "v*"],
    ["Pain chocolat", ["masa", "chocolate"], 0.7, 3.6, "v"],
    ["Scone nata", ["masa", "nata", "mermelada"], 0.8, 4.2, "v"],
    ["Eggs Benedict", ["huevo", "pan", "jamon", "mantequilla"], 1.6, 8.8, ""],
    ["Avocado toast", ["pan", "aguacate", "huevo"], 1.4, 7.5, "v"],
    ["Flat white", ["cafe", "leche"], 0.5, 3.2, "v"],
    ["Carrot cake", ["masa", "azucar", "queso"], 1.0, 4.8, "v"],
    ["Zumo naranja", ["naranja"], 0.6, 3.4, "v"],
  ]);
  const CAFE = dishes([
    ["Espresso", ["cafe"], 0.25, 1.8, "v*"],
    ["Cappuccino", ["cafe", "leche"], 0.45, 2.9, "v"],
    ["Tostada tomate", ["pan", "tomate", "aceite"], 0.7, 3.8, "v"],
    ["Bikini jamón", ["pan", "jamon", "queso"], 1.1, 5.2, ""],
    ["Bowl avena", ["avena", "leche", "miel"], 0.7, 4.4, "v"],
    ["Zumo naranja", ["naranja"], 0.6, 3.2, "v"],
    ["Cookie", ["masa", "chocolate", "azucar"], 0.5, 2.8, "v"],
    ["Té earl grey", ["te"], 0.3, 2.4, "v"],
  ]);
  const DOLCE = dishes([
    ["Cannoli", ["masa", "ricotta", "azucar"], 1.0, 4.8, "v*"],
    ["Sfogliatella", ["masa", "ricotta", "naranja"], 1.1, 5.0, "v"],
    ["Tiramisú", ["cafe", "queso", "azucar"], 1.2, 5.6, "v"],
    ["Panna cotta", ["nata", "azucar", "vainilla"], 0.9, 4.6, "v"],
    ["Espresso", ["cafe"], 0.25, 1.8, "v"],
    ["Affogato", ["cafe", "leche", "azucar"], 0.7, 4.2, "v"],
    ["Biscotti", ["almendra", "azucar", "masa"], 0.5, 3.0, "v"],
    ["Limoncello", ["licor", "limon"], 1.4, 5.5, "a"],
  ]);
  const CHOCO = dishes([
    ["Chocolate caliente", ["chocolate", "leche"], 0.8, 4.4, "v*"],
    ["Coulant", ["chocolate", "huevo", "azucar"], 1.2, 6.2, "v"],
    ["Trufas 6", ["chocolate", "nata"], 1.4, 7.5, "v"],
    ["Brownie", ["chocolate", "huevo", "azucar"], 0.9, 4.6, "v"],
    ["Churros & chocolate", ["masa", "chocolate"], 0.8, 4.8, "v"],
    ["Mousse", ["chocolate", "nata", "huevo"], 1.0, 5.4, "v"],
    ["Café mocha", ["cafe", "chocolate", "leche"], 0.7, 3.8, "v"],
    ["Bombones caja", ["chocolate"], 2.2, 9.5, "v"],
  ]);
  const GELATO = dishes([
    ["Gianduja", ["leche", "chocolate", "avellana"], 0.7, 3.8, "v*"],
    ["Pistacho", ["leche", "azucar", "almendra"], 0.8, 4.0, "v"],
    ["Limone", ["limon", "azucar", "agua"], 0.5, 3.4, "v"],
    ["Stracciatella", ["leche", "chocolate", "azucar"], 0.7, 3.8, "v"],
    ["Affogato", ["cafe", "leche"], 0.7, 4.4, "v"],
    ["Coppa 3 gusti", ["leche", "azucar"], 1.2, 5.6, "v"],
    ["Brioche gelato", ["masa", "leche"], 1.1, 5.2, "v"],
    ["Espresso", ["cafe"], 0.25, 1.8, "v"],
  ]);
  const SWEET = dishes([
    ["Tarta chocolate", ["chocolate", "huevo", "azucar"], 1.3, 5.8, "v*"],
    ["Cheesecake", ["queso", "azucar", "galleta"], 1.1, 5.4, "v"],
    ["Tarta limón", ["limon", "huevo", "azucar"], 1.0, 5.2, "v"],
    ["Macaron 5", ["almendra", "azucar"], 1.4, 6.8, "v"],
    ["Profiteroles", ["masa", "nata", "chocolate"], 1.2, 5.9, "v"],
    ["Tarta temporada", ["fruta", "masa", "azucar"], 1.3, 5.6, "v"],
    ["Té & scone", ["te", "masa", "nata"], 0.9, 4.8, "v"],
    ["Café filtro", ["cafe"], 0.3, 2.2, "v"],
  ]);
  const BRUNCH = dishes([
    ["Brunch Horizon", ["huevo", "bacon", "pan", "aguacate"], 2.4, 14.5, "*"],
    ["French toast", ["pan", "huevo", "miel"], 1.4, 9.2, "v"],
    ["Eggs royale", ["huevo", "salmon", "pan"], 2.2, 13.5, ""],
    ["Granola bowl", ["avena", "yogurt", "fruta"], 1.2, 8.4, "v"],
    ["Bloody Mary", ["vodka", "tomate", "limon"], 1.8, 8.5, "a"],
    ["Mimosa", ["cava", "naranja"], 2.2, 8.8, "a"],
    ["Zumo prensado", ["naranja", "zanahoria"], 0.9, 4.6, "v"],
    ["Café de finca", ["cafe", "leche"], 0.6, 3.6, "v"],
  ]);
  const EXPRESS = dishes([
    ["Burger viaje", ["pan_burger", "carne_picada", "cheddar"], 1.5, 6.4, "*"],
    ["Wrap pollo", ["tortilla", "pollo", "lechuga"], 1.4, 5.9, ""],
    ["Sandwich jamón", ["pan", "jamon", "queso"], 1.2, 5.2, ""],
    ["Ensalada vaso", ["lechuga", "tomate", "aceite"], 1.0, 4.8, "v"],
    ["Café para llevar", ["cafe", "leche"], 0.4, 2.6, "v"],
    ["Agua & snack", ["agua", "pan"], 0.3, 2.2, "v"],
    ["Yogur", ["yogurt", "miel"], 0.5, 2.8, "v"],
    ["Brownie", ["chocolate", "azucar"], 0.6, 3.2, "v"],
  ]);
  const EVENTS = dishes([
    ["Cocktail bienvenida", ["cava", "naranja"], 2.2, 6.5, "a*"],
    ["Canapé salmón", ["pan", "salmon", "nata"], 1.4, 5.8, ""],
    ["Mini burger", ["pan_burger", "carne_picada"], 1.3, 5.4, ""],
    ["Risotto setas", ["arroz", "setas", "parmesano"], 2.0, 9.5, "v"],
    ["Lomo bajo", ["ternera", "sal"], 3.6, 16, ""],
    ["Buffet ensaladas", ["lechuga", "tomate", "aceite"], 1.1, 5.2, "v"],
    ["Tarta nupcial", ["masa", "azucar", "nata"], 1.8, 7.4, "v"],
    ["Café & petit", ["cafe", "chocolate"], 0.6, 3.4, "v"],
  ]);
  const MARKET = dishes([
    ["Puesto ramen", ["fideos", "caldo", "cerdo"], 2.0, 9.5, ""],
    ["Puesto tacos", ["tortilla", "ternera", "salsa"], 1.5, 7.2, "s"],
    ["Puesto pizza", ["masa", "mozzarella", "tomate"], 1.6, 8.0, "v"],
    ["Puesto poke", ["arroz", "salmon", "aguacate"], 2.2, 10.5, ""],
    ["Puesto bao", ["bao", "cerdo"], 1.4, 6.8, ""],
    ["Cerveza del hall", ["cerveza"], 0.9, 4.2, "a"],
    ["Helado vaso", ["leche", "azucar"], 0.6, 3.6, "v"],
    ["Tabla sharing", ["queso", "pan", "aceituna"], 1.8, 8.4, "v"],
  ]);
  const SIGNATURE = dishes([
    ["Menú degustación", ["ternera", "vieira", "trufa"], 18, 85, "*"],
    ["Vieira cítricos", ["vieira", "lima", "aceite"], 4.2, 22, ""],
    ["Cordero lascas", ["cordero", "romero"], 5.4, 28, ""],
    ["Pescado del día", ["merluza", "mantequilla"], 4.8, 26, ""],
    ["Risotto azafrán", ["arroz", "azafran", "parmesano"], 3.2, 18, "v"],
    ["Prepostre", ["fruta", "azucar"], 1.4, 8, "v"],
    ["Petit fours", ["chocolate", "almendra"], 1.6, 9, "v"],
    ["Maridaje copas", ["vino_tinto", "vino_blanco"], 6.5, 24, "a"],
  ]);
  const TERRA = dishes([
    ["Tomate de huerta", ["tomate", "aceite", "sal"], 1.8, 12, "v*"],
    ["Pescado a la sal", ["merluza", "sal", "hierbas"], 4.4, 24, ""],
    ["Cordero caldereta", ["cordero", "tomate", "vino_tinto"], 4.8, 26, ""],
    ["Arroz señoret", ["arroz", "gamba", "calamar"], 3.6, 22, ""],
    ["Burrata", ["mozzarella", "tomate", "aceite"], 2.2, 14, "v"],
    ["Naranja & AOVE", ["naranja", "aceite", "azucar"], 1.2, 8, "v"],
    ["Copa priorat", ["vino_tinto"], 3.0, 11, "a"],
    ["Crema catalana", ["leche", "huevo", "azucar"], 1.1, 7.5, "v"],
  ]);
  const NOIR = dishes([
    ["Carpaccio ahumado", ["ternera", "aceite", "parmesano"], 3.4, 18, "*"],
    ["Lubina piel", ["pescado", "mantequilla"], 4.6, 24, ""],
    ["Pichón cacao", ["pavo", "chocolate", "vino_tinto"], 5.2, 28, ""],
    ["Ravioli trufa", ["pasta", "trufa", "mantequilla"], 3.8, 21, "v"],
    ["Sorbete hierbas", ["limon", "hierbas", "azucar"], 1.2, 7.5, "v"],
    ["Coulant sal", ["chocolate", "sal", "huevo"], 1.5, 9.2, "v"],
    ["Copa borgoña", ["vino_tinto"], 3.4, 12, "a"],
    ["Digestif", ["licor"], 2.2, 8.5, "a"],
  ]);

  const IDENT = {
    roble: { order: 1, name: "Horizon Grill", short: "HG", cuisines: ["asador", "carnes"], tier: "luxury", color: "#6B2D1A", color2: "#1A120C", tagline: "La parrilla de la casa matriz." },
    olivo: { order: 2, name: "Casa Oliva", short: "CO", cuisines: ["mediterránea", "española"], tier: "casual", color: "#5C7A3A", color2: "#3D2B1F", tagline: "Aceite, huerta y mesa larga." },
    marea: { order: 3, name: "Maré", short: "MA", cuisines: ["pescado", "mariscos"], tier: "casual", color: "#1D6FA3", color2: "#0B3A5C", tagline: "La costa, sin adornos." },
    farol: { order: 4, name: "Sakura House", short: "SH", cuisines: ["japonesa", "izakaya"], tier: "casual", color: "#C45C6A", color2: "#3A1C24", tagline: "Japón de diario, con farol." },
    nudo: { order: 5, name: "Tokyo Ramen", short: "TR", cuisines: ["japonesa", "ramen"], tier: "casual", color: "#C45C26", color2: "#2B140C", tagline: "Caldo largo, cola corta." },
    cinta: { order: 6, name: "Kumo Sushi", short: "KS", cuisines: ["japonesa", "sushi"], tier: "luxury", color: "#1C3A4A", color2: "#0A161C", tagline: "Nube, cuchillo y pescado." },
    wok: { order: 7, name: "Dragon Wok", short: "DW", cuisines: ["china", "wok"], tier: "casual", color: "#C1121F", color2: "#2B0A0C", tagline: "El wok no espera." },
    thai: { order: 8, name: "Bangkok Street", short: "BS", cuisines: ["tailandesa"], tier: "casual", color: "#E85D04", color2: "#3D1F0A", tagline: "Dulce, ácido, picante, calle." },
    monzon: { order: 9, name: "Bombay Spice", short: "BX", cuisines: ["india"], tier: "casual", color: "#B85C38", color2: "#2C1810", tagline: "Especias de ida y vuelta." },
    seul: { order: 10, name: "Seoul Kitchen", short: "SK", cuisines: ["coreana"], tier: "casual", color: "#9B2226", color2: "#1A0A0C", tagline: "Parrilla, kimchi y banchan." },
    palazzo: { order: 11, name: "La Trattoria", short: "LT", cuisines: ["italiana"], tier: "casual", color: "#2D6A4F", color2: "#14261C", tagline: "La nonna, sin teatro." },
    vesubio: { order: 12, name: "Roma Pasta", short: "RP", cuisines: ["italiana", "pasta"], tier: "casual", color: "#BC4749", color2: "#3A1C14", tagline: "Pasta fresca, agua de Roma." },
    pizza: { order: 13, name: "Napoli 72", short: "N7", cuisines: ["italiana", "pizza"], tier: "casual", color: "#E63946", color2: "#1D3557", tagline: "Horno a 72 horas de masa." },
    nieve: { order: 14, name: "Vesuvio", short: "VE", cuisines: ["italiana", "pizza"], tier: "casual", color: "#6A040F", color2: "#1A0A08", tagline: "Pizza moderna, lava de tomate.", dishes: PIZZA },
    empanada: { order: 15, name: "Buenos Aires 1870", short: "BA", cuisines: ["argentina", "parrilla"], tier: "casual", color: "#6B4F2A", color2: "#1C140C", tagline: "Parrilla del ochenta setenta." },
    arena: { order: 16, name: "México Lindo", short: "ML", cuisines: ["mexicana"], tier: "casual", color: "#2D6A4F", color2: "#9B2226", tagline: "México de mesa, no de paso.", dishes: MEX },
    bao: { order: 17, name: "Taco Norte", short: "TN", cuisines: ["mexicana", "tex-mex"], tier: "fast_food", color: "#E9C46A", color2: "#9B2226", tagline: "Taco de mostrador, norte.", dishes: TACOS },
    jerk: { order: 18, name: "Havana", short: "HV", cuisines: ["caribeña", "cubana"], tier: "casual", color: "#2A9D8F", color2: "#BC4749", tagline: "Son, cerdo y lima." },
    pampa: { order: 19, name: "Rio Brasa", short: "RB", cuisines: ["brasileña", "parrilla"], tier: "casual", color: "#40916C", color2: "#1B4332", tagline: "Rodizio que no se apaga." },
    ola: { order: 20, name: "Andes", short: "AN", cuisines: ["peruana"], tier: "casual", color: "#C1121F", color2: "#1D3557", tagline: "Altura, lima y mar." },
    pho: { order: 21, name: "The Burger Lab", short: "BL", cuisines: ["americana", "hamburguesas"], tier: "casual", color: "#264653", color2: "#E76F51", tagline: "Hamburguesa de laboratorio.", dishes: BURGER_LAB },
    bufalo: { order: 22, name: "Horizon Burgers", short: "HB", cuisines: ["americana", "hamburguesas"], tier: "fast_food", color: "#E85D04", color2: "#9B2226", tagline: "La rápida de la casa." },
    pollo: { order: 23, name: "Chicken District", short: "CD", cuisines: ["americana", "pollo frito"], tier: "fast_food", color: "#F4A261", color2: "#9B2226", tagline: "El barrio del pollo crujiente." },
    dumpling: { order: 24, name: "Wing Factory", short: "WF", cuisines: ["americana", "pollo frito"], tier: "fast_food", color: "#E63946", color2: "#1D3557", tagline: "Alitas en cadena.", dishes: WINGS },
    frankfurt: { order: 25, name: "Urban Dogs", short: "UD", cuisines: ["americana", "hot dog"], tier: "food_truck", color: "#E9C46A", color2: "#1D3557", tagline: "Perrito de acera." },
    carbon: { order: 26, name: "Fire & Smoke", short: "FS", cuisines: ["americana", "barbacoa"], tier: "casual", color: "#6B2D1A", color2: "#1A120C", tagline: "Humo lento, hambre rápida." },
    gyros: { order: 27, name: "Route 66 Diner", short: "R6", cuisines: ["americana", "diner"], tier: "casual", color: "#E63946", color2: "#457B9D", tagline: "Neon, pie y café de jarra.", dishes: DINER },
    nord: { order: 28, name: "The Steak Room", short: "SR", cuisines: ["asador", "carnes"], tier: "luxury", color: "#1A120C", color2: "#6B2D1A", tagline: "La sala de la carne.", dishes: STEAK },
    linterna: { order: 29, name: "Black Pepper", short: "BP", cuisines: ["internacional", "francesa"], tier: "casual", color: "#212529", color2: "#ADB5BD", tagline: "Cocina contemporánea, pimienta negra." },
    mezze: { order: 30, name: "The Garden Table", short: "GT", cuisines: ["vegetariana", "mediterránea"], tier: "casual", color: "#52796F", color2: "#2C3E2C", tagline: "La huerta se sienta.", dishes: GARDEN },
    poke: { order: 31, name: "Green Bowl", short: "GB", cuisines: ["hawaiana", "poké"], tier: "casual", color: "#2A9D8F", color2: "#1B4332", tagline: "Bowl verde, hambre clara." },
    falafel: { order: 32, name: "Fresh & Co.", short: "FC", cuisines: ["ensaladas", "vegetariana"], tier: "fast_food", color: "#95D5B2", color2: "#1B4332", tagline: "Rápido y fresco.", dishes: HEALTHY },
    alpina: { order: 33, name: "Pasta & Co.", short: "PC", cuisines: ["italiana", "pasta"], tier: "fast_food", color: "#BC4749", color2: "#F4A261", tagline: "Pasta de mostrador.", dishes: PASTA_FAST },
    eclipse: { order: 34, name: "Baker Street", short: "BK", cuisines: ["café", "brunch"], tier: "casual", color: "#C9A227", color2: "#3D2B1F", tagline: "Horno, mantequilla y periódico.", dishes: BAKERY },
    cerveza: { order: 35, name: "Horizon Café", short: "HC", cuisines: ["café", "desayunos"], tier: "casual", color: "#6F4E37", color2: "#1A120C", tagline: "El café de la matriz.", dishes: CAFE },
    vermu: { order: 36, name: "Dolce Vita", short: "DV", cuisines: ["italiana", "postres"], tier: "casual", color: "#C45C6A", color2: "#5C2A32", tagline: "Dulce, italiano, de vitrina.", dishes: DOLCE },
    tequila: { order: 37, name: "ChocoLab", short: "CL", cuisines: ["postres", "chocolate"], tier: "casual", color: "#3D2B1F", color2: "#C9A227", tagline: "Cacao de laboratorio.", dishes: CHOCO },
    bodega: { order: 38, name: "Gelato Milano", short: "GM", cuisines: ["postres", "heladería"], tier: "casual", color: "#90E0EF", color2: "#0077B6", tagline: "Helado de manteca, no de prisa.", dishes: GELATO },
    whisky: { order: 39, name: "Sweet Avenue", short: "SA", cuisines: ["postres"], tier: "casual", color: "#E8B4B8", color2: "#6B2D4A", tagline: "La avenida del azúcar.", dishes: SWEET },
    absenta: { order: 40, name: "Sunrise Brunch", short: "SB", cuisines: ["brunch", "desayunos"], tier: "casual", color: "#F4A261", color2: "#E76F51", tagline: "El día empieza en mesa.", dishes: BRUNCH },
    latitud: { order: 41, name: "Sky Lounge", short: "SL", cuisines: ["cócteles"], tier: "bar", color: "#1D3557", color2: "#C9A227", tagline: "Azotea, hielo y skyline." },
    polar: { order: 42, name: "Horizon Rooftop", short: "HR", cuisines: ["cócteles", "alta cocina"], tier: "luxury", color: "#0B3A5C", color2: "#E9C46A", tagline: "La vista de la matriz." },
    seda: { order: 43, name: "Noir", short: "NO", cuisines: ["alta cocina", "internacional"], tier: "luxury", color: "#111111", color2: "#4A4A4A", tagline: "Oscuro, preciso, contemporáneo.", dishes: NOIR },
    etoile: { order: 44, name: "Élan", short: "ÉL", cuisines: ["francesa", "alta cocina"], tier: "luxury", color: "#1D3557", color2: "#C9A227", tagline: "Francia, sin prisa." },
    rubi: { order: 45, name: "The Signature", short: "SG", cuisines: ["alta cocina", "internacional"], tier: "luxury", color: "#5C2A32", color2: "#C9A227", tagline: "La firma del grupo.", dishes: SIGNATURE },
    mar: { order: 46, name: "Oceanic", short: "OC", cuisines: ["mariscos", "alta cocina"], tier: "luxury", color: "#0077B6", color2: "#023047", tagline: "El mar en mantel." },
    sakura: { order: 47, name: "Terra", short: "TE", cuisines: ["mediterránea", "alta cocina"], tier: "luxury", color: "#3D5A3D", color2: "#C9A227", tagline: "Autor, huerta y Mediterráneo.", dishes: TERRA },
    tropico: { order: 48, name: "Horizon Events", short: "HE", cuisines: ["internacional", "banquetes"], tier: "casual", color: "#1D3557", color2: "#C9A227", tagline: "Banquetes con sello Horizon.", dishes: EVENTS },
    doner: { order: 49, name: "Horizon Express", short: "HX", cuisines: ["americana", "callejera"], tier: "fast_food", color: "#264653", color2: "#E9C46A", tagline: "Estación, aeropuerto, bandeja.", dishes: EXPRESS },
    taco: { order: 50, name: "Horizon Market", short: "HM", cuisines: ["internacional", "food hall"], tier: "casual", color: "#2A9D8F", color2: "#1D3557", tagline: "Un hall, muchos fogones.", dishes: MARKET },
  };

  for (const b of BRAND.list) {
    const h = IDENT[b.id];
    if (!h) continue;
    b.name = h.name;
    b.short = h.short;
    b.cuisines = h.cuisines.slice();
    b.tier = h.tier;
    b.color = h.color;
    b.color2 = h.color2;
    b.tagline = h.tagline;
    b.order = h.order;
    b.holding = HOLDING;
    b.tierInfo = BRAND.tiers[b.tier];
    if (h.dishes) b.dishes = h.dishes;
    b.logoFile = "img/filiales/" + b.id + ".png";
    b.logo = `<img src="${b.logoFile}" alt="${b.name}" width="64" height="64">`;
  }

  BRAND.list.sort((a, c) => (a.order || 99) - (c.order || 99));
  BRAND.HOLDING = HOLDING;
  BRAND.cuisines.splice(0, BRAND.cuisines.length, ...[...new Set(BRAND.list.flatMap((b) => b.cuisines))].sort((a, c) => a.localeCompare(c, "es")));
})();
