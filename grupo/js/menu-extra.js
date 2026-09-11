/* Horizon Restaurant Group — packs extra de carta por cocina y tramo */
(function () {
  const D = BRAND.D;
  const PACKS = {
    hamburguesas: [
      D("Smash cheddar", ["pan_burger", "carne_picada", "cheddar", "cebolla"], 1.7, 6.4, ""),
      D("BBQ bacon melt", ["pan_burger", "carne_picada", "bacon", "salsa"], 2.2, 7.6, "s"),
      D("Kimchi smash", ["pan_burger", "carne_picada", "kimchi", "mayo"], 1.9, 6.9, "s"),
      D("Aguacate ranch", ["pan_burger", "pollo", "aguacate", "lechuga"], 1.8, 6.7, ""),
      D("Blue cheese", ["pan_burger", "carne_picada", "queso", "cebolla"], 2.0, 7.2, ""),
      D("Hawaiiana burger", ["pan_burger", "carne_picada", "pina", "cheddar"], 1.8, 6.5, ""),
      D("Kids mini", ["pan_burger", "carne_picada", "ketchup"], 1.0, 3.8, ""),
      D("Onion stack", ["pan_burger", "carne_picada", "cebolla", "salsa"], 1.7, 6.2, ""),
    ],
    americana: [
      D("Mac cheese copa", ["pasta", "cheddar", "leche"], 1.1, 4.8, "v"),
      D("Chili bowl", ["carne_picada", "judias", "chile", "tomate"], 1.6, 6.1, "s"),
      D("Pancakes sirope", ["masa", "huevo", "miel"], 0.8, 4.2, "v"),
      D("Hot brownie", ["chocolate", "huevo", "azucar"], 0.7, 3.9, "v"),
      D("Iced tea casa", ["te", "hielo", "limon"], 0.25, 2.2, "v"),
      D("Corn dog", ["pan_hotdog", "cerdo", "mostaza"], 1.1, 4.5, ""),
    ],
    "pollo frito": [
      D("Cubo familiar 12", ["pollo", "aceite", "pimenton"], 3.4, 12.5, ""),
      D("Burger picante", ["pan_burger", "pollo", "chile", "mayo"], 1.6, 6.2, "s"),
      D("Waffle pollo", ["masa", "pollo", "miel"], 1.8, 7.1, ""),
      D("Alitas miel", ["pollo", "miel", "pimenton"], 1.5, 5.9, ""),
      D("Nuggets 9", ["pollo", "aceite"], 1.3, 5.2, ""),
      D("Ensalada crispy", ["lechuga", "pollo", "tomate"], 1.4, 5.8, ""),
    ],
    mexicana: [
      D("Quesadilla mix", ["tortilla", "queso", "pollo", "chile"], 1.5, 6.4, "s"),
      D("Burrito asada", ["tortilla", "ternera", "arroz", "frijoles"], 2.0, 7.8, ""),
      D("Elote calle", ["maiz", "mayo", "chile", "lima"], 0.7, 3.4, "v"),
      D("Guacamole & chips", ["aguacate", "tomate", "lima", "tortilla"], 1.2, 5.1, "v"),
      D("Taco pescado", ["tortilla", "bacalao", "repollo", "lima"], 1.7, 6.8, ""),
      D("Churros canela", ["masa", "azucar", "canela"], 0.6, 3.5, "v"),
      D("Agua de horchata", ["leche", "azucar", "canela", "hielo"], 0.4, 2.6, "v"),
      D("Nachos loaded", ["tortilla", "queso", "chile", "tomate"], 1.4, 5.9, "s"),
    ],
    "tex-mex": [
      D("Fajitas sartén", ["ternera", "pimiento", "cebolla", "tortilla"], 2.2, 8.4, "s"),
      D("Chimichanga", ["tortilla", "pollo", "queso", "aceite"], 1.8, 7.0, ""),
      D("Chili cheese fries", ["patata", "carne_picada", "cheddar"], 1.3, 5.4, ""),
    ],
    italiana: [
      D("Carbonara", ["pasta", "huevo", "bacon", "parmesano"], 1.8, 8.2, ""),
      D("Amatriciana", ["pasta", "tomate", "chorizo", "pecorino"], 1.6, 7.6, ""),
      D("Lasagna casa", ["pasta", "carne_picada", "tomate", "mozzarella"], 2.1, 9.0, ""),
      D("Risotto setas", ["arroz", "setas", "parmesano", "mantequilla"], 1.9, 8.8, "v"),
      D("Caprese", ["tomate", "mozzarella", "albahaca", "aceite"], 1.4, 6.5, "v"),
      D("Tiramisú", ["cafe", "queso", "azucar", "huevo"], 1.1, 5.4, "v"),
      D("Panna cotta", ["nata", "azucar", "vainilla"], 0.9, 4.8, "v"),
      D("Aperol spritz", ["licor", "cava", "naranja", "hielo"], 1.8, 7.5, "a"),
    ],
    pizza: [
      D("Diávola", ["masa", "tomate", "mozzarella", "chorizo", "chile"], 1.7, 8.4, "s"),
      D("Cuatro quesos", ["masa", "mozzarella", "parmesano", "queso", "cheddar"], 1.9, 8.9, "v"),
      D("Prosciutto rúcula", ["masa", "jamon", "mozzarella", "tomate"], 2.2, 9.6, ""),
      D("Calzone", ["masa", "ricotta", "jamon", "mozzarella"], 1.8, 8.2, ""),
      D("Focaccia aceite", ["masa", "aceite", "romero"], 0.7, 3.8, "v"),
      D("Pizza bianca", ["masa", "mozzarella", "setas", "aceite"], 1.6, 7.9, "v"),
    ],
    turca: [
      D("Lahmacun", ["masa", "carne_picada", "tomate", "perejil"], 1.4, 5.8, "s"),
      D("Adana", ["cordero", "pimenton", "pita"], 2.1, 8.2, "s"),
      D("Pide queso", ["masa", "queso", "huevo"], 1.3, 5.6, "v"),
      D("Baklava", ["almendra", "miel", "mantequilla"], 0.9, 4.4, "v"),
      D("Ayran", ["yogurt", "agua", "sal"], 0.3, 2.1, "v"),
      D("Köfte plato", ["carne_picada", "cebolla", "especias", "arroz"], 1.8, 7.2, ""),
    ],
    kebab: [
      D("Dürüm pollo", ["pita", "pollo", "lechuga", "salsa"], 1.6, 6.4, ""),
      D("Plato mixto", ["cordero", "pollo", "arroz", "ensalada"], 2.4, 9.2, ""),
      D("Patatas kebab", ["patata", "carne_picada", "salsa"], 1.2, 5.0, ""),
      D("Falafel dürüm", ["pita", "garbanzo", "tahini", "lechuga"], 1.3, 5.5, "v"),
    ],
    china: [
      D("Arroz frito casa", ["arroz", "huevo", "cebolla", "soja"], 1.1, 5.4, "v"),
      D("Pollo kung pao", ["pollo", "cacahuete", "chile", "soja"], 1.7, 7.2, "s"),
      D("Cerdo agridulce", ["cerdo", "pina", "pimiento"], 1.6, 6.9, ""),
      D("Sopa wonton", ["fideos", "cerdo", "caldo", "cebolla"], 1.2, 5.6, ""),
      D("Rollitos primavera", ["masa", "verdura", "aceite"], 0.8, 4.2, "v"),
      D("Té jazmín", ["te", "agua"], 0.2, 1.9, "v"),
      D("Mapo tofu", ["tofu", "chile", "soja", "cerdo"], 1.4, 6.3, "s"),
      D("Pato pekín mini", ["pato", "crepe", "salsa"], 2.6, 11, ""),
    ],
    bao: [
      D("Bao cerdo lacado", ["bao", "cerdo", "pepino", "soja"], 1.5, 6.2, ""),
      D("Bao shiitake", ["bao", "setas", "soja"], 1.2, 5.4, "v"),
      D("Bao pollo frito", ["bao", "pollo", "mayo", "chile"], 1.5, 6.4, "s"),
      D("Dumpling sopa", ["masa", "cerdo", "caldo"], 1.3, 5.8, ""),
    ],
    levantina: [
      D("Falafel plato", ["garbanzo", "tahini", "ensalada", "pita"], 1.3, 6.0, "v"),
      D("Shawarma mix", ["pita", "pollo", "tahini", "pepino"], 1.7, 6.8, ""),
      D("Tabulé", ["trigo", "tomate", "menta", "limon"], 0.9, 4.6, "v"),
      D("Labneh aceite", ["yogurt", "aceite", "menta"], 0.8, 4.2, "v"),
      D("Baklava pistacho", ["almendra", "miel"], 1.0, 4.8, "v"),
    ],
    callejera: [
      D("Patatas calle", ["patata", "especias", "salsa"], 0.7, 3.6, "v"),
      D("Sándwich huevo", ["pan", "huevo", "salsa"], 0.9, 4.1, "v"),
    ],
    alemana: [
      D("Schnitzel", ["cerdo", "pan", "limon"], 2.0, 8.6, ""),
      D("Bratwurst plato", ["cerdo", "mostaza", "pan"], 1.5, 6.4, ""),
      D("Pretzel mantequilla", ["masa", "mantequilla"], 0.6, 3.2, "v"),
      D("Kartoffelsalat", ["patata", "vinagre", "cebolla"], 0.8, 3.9, "v"),
      D("Apfelstrudel", ["masa", "manzana", "canela"], 0.9, 4.5, "v"),
      D("Radler", ["cerveza", "limon", "hielo"], 0.8, 3.8, "a"),
    ],
    "hot dog": [
      D("Chicago dog", ["pan_hotdog", "cerdo", "mostaza", "pepino"], 1.3, 5.2, ""),
      D("Chili dog", ["pan_hotdog", "cerdo", "carne_picada", "cheddar"], 1.6, 6.1, "s"),
      D("Käsekrainer", ["pan_hotdog", "cerdo", "queso", "mostaza"], 1.5, 5.8, ""),
    ],
    argentina: [
      D("Entraña", ["ternera", "chimichurri", "limon"], 3.2, 14, ""),
      D("Provoleta", ["queso", "oregano", "aceite"], 1.4, 6.8, "v"),
      D("Choripán", ["pan", "chorizo", "chimichurri"], 1.5, 6.2, ""),
      D("Milanesa napolitana", ["ternera", "tomate", "mozzarella"], 2.4, 10.5, ""),
      D("Flan casero", ["huevo", "leche", "azucar"], 0.7, 3.8, "v"),
      D("Fernet cola", ["licor", "soda", "hielo"], 1.4, 6.0, "a"),
    ],
    empanadas: [
      D("Empanada humita", ["masa_empanada", "maiz", "queso"], 0.9, 3.6, "v"),
      D("Empanada carne picante", ["masa_empanada", "carne_picada", "chile"], 1.1, 4.2, "s"),
      D("Empanada atún", ["masa_empanada", "atun", "huevo"], 1.1, 4.4, ""),
      D("Docena mix", ["masa_empanada", "carne_picada", "queso"], 4.8, 18, ""),
    ],
    japonesa: [
      D("Edamame sal", ["edamame", "sal"], 0.7, 3.8, "v"),
      D("Gyoza plancha", ["masa", "cerdo", "soja"], 1.3, 5.9, ""),
      D("Katsu don", ["arroz", "pollo", "huevo", "soja"], 1.8, 7.8, ""),
      D("Karaage", ["pollo", "aceite", "soja"], 1.5, 6.6, ""),
      D("Mochi helado", ["arroz", "azucar", "helado"], 0.8, 4.2, "v"),
      D("Té sencha", ["te", "agua"], 0.25, 2.4, "v"),
      D("Onigiri salmón", ["arroz", "salmon", "algas"], 1.1, 4.9, ""),
    ],
    sushi: [
      D("Nigiri mix 8", ["arroz_sushi", "salmon", "atun"], 3.2, 14, ""),
      D("Uramaki spicy tuna", ["arroz_sushi", "atun", "mayo", "chile"], 2.4, 11, "s"),
      D("Sashimi mora", ["salmon", "atun", "wasabi"], 3.8, 16, ""),
      D("California roll", ["arroz_sushi", "cangrejo", "aguacate", "algas"], 2.0, 9.2, ""),
      D("Tamago nigiri", ["arroz_sushi", "huevo"], 1.0, 5.4, "v"),
    ],
    ramen: [
      D("Shoyu clásico", ["fideos", "caldo", "soja", "cerdo", "huevo"], 1.9, 8.4, ""),
      D("Miso vegetariano", ["fideos", "miso", "tofu", "algas_wakame"], 1.6, 7.6, "v"),
      D("Tsukemen", ["fideos", "caldo", "cerdo"], 2.1, 9.0, ""),
      D("Chashu extra", ["cerdo", "soja"], 1.2, 4.8, ""),
      D("Gyoza 6", ["masa", "cerdo"], 1.2, 5.5, ""),
    ],
    izakaya: [
      D("Yakitori mix", ["pollo", "soja", "azucar"], 1.6, 7.2, ""),
      D("Takoyaki", ["masa", "pulpo", "mayo"], 1.4, 6.4, ""),
      D("Highball", ["whisky", "soda", "hielo"], 1.6, 7.0, "a"),
      D("Edamame picante", ["edamame", "chile"], 0.8, 4.1, "vs"),
      D("Karaage limón", ["pollo", "limon", "mayo"], 1.5, 6.5, ""),
    ],
    kaiseki: [
      D("Hassun estación", ["pescado", "verdura", "soja"], 4.5, 22, "*"),
      D("Wanmono", ["caldo", "tofu", "setas"], 2.2, 12, "v"),
      D("Yakimono", ["pescado", "sal", "limon"], 3.8, 18, ""),
      D("Mizumono", ["fruta", "azucar"], 1.4, 8, "v"),
      D("Sake junmai", ["sake", "agua"], 2.8, 11, "a"),
    ],
    española: [
      D("Tortilla española", ["huevo", "patata", "cebolla"], 1.2, 5.8, "v"),
      D("Gambas al ajillo", ["gamba", "ajo", "aceite", "guindilla"], 2.4, 9.8, "s"),
      D("Croquetas jamón", ["jamon", "leche", "pan"], 1.3, 6.2, ""),
      D("Pan tumaca", ["pan", "tomate", "aceite"], 0.5, 3.2, "v"),
      D("Crema catalana", ["leche", "huevo", "azucar"], 0.8, 4.4, "v"),
      D("Tinto verano", ["vino_tinto", "soda", "limon"], 1.1, 4.8, "a"),
    ],
    tapas: [
      D("Patatas bravas", ["patata", "salsa", "pimenton"], 0.8, 4.2, "vs"),
      D("Pulpo feira", ["pulpo", "pimenton", "aceite"], 2.6, 11.5, ""),
      D("Boquerones", ["anchoa", "vinagre", "ajo"], 1.2, 5.9, ""),
      D("Tabla ibéricos", ["ibérico", "pan", "tomate"], 3.4, 14, ""),
    ],
    francesa: [
      D("Soupe oignon", ["cebolla", "caldo", "pan", "queso"], 1.3, 6.8, "v"),
      D("Steak frites", ["ternera", "patata", "mantequilla"], 3.6, 16, ""),
      D("Quiche lorraine", ["masa", "huevo", "bacon", "nata"], 1.5, 7.4, ""),
      D("Crème brûlée", ["nata", "huevo", "azucar", "vainilla"], 1.1, 5.9, "v"),
      D("Île flottante", ["leche", "huevo", "azucar"], 0.9, 5.2, "v"),
      D("Kir royal", ["cava", "licor"], 2.2, 9.5, "a"),
    ],
    "alta cocina": [
      D("Amuse bouche", ["trufa", "huevo"], 2.8, 12, "*"),
      D("Pigeon o setas", ["setas", "foie", "vino_tinto"], 5.5, 28, ""),
      D("Sorbete limón", ["limon", "azucar"], 0.8, 6, "v"),
      D("Petit fours", ["almendra", "chocolate", "azucar"], 1.6, 9, "v"),
      D("Maridaje copa", ["vino_tinto"], 3.2, 12, "a"),
    ],
    india: [
      D("Butter chicken", ["pollo", "tomate", "nata", "garam"], 1.9, 8.4, "s"),
      D("Palak paneer", ["espinaca", "queso", "especias"], 1.5, 7.2, "v"),
      D("Biryani cordero", ["arroz", "cordero", "azafran"], 2.4, 10.2, "s"),
      D("Samosa 2", ["masa", "patata", "guisante", "especias"], 0.8, 4.1, "v"),
      D("Naan ajo", ["pan", "ajo", "mantequilla"], 0.5, 2.8, "v"),
      D("Lassi mango", ["yogurt", "mango", "azucar"], 0.7, 3.6, "v"),
      D("Gulab jamun", ["leche", "azucar", "cardamomo"], 0.6, 3.4, "v"),
      D("Masala chai", ["te", "leche", "cardamomo", "canela"], 0.4, 2.5, "v"),
    ],
    coreana: [
      D("Bibimbap", ["arroz", "verdura", "huevo", "gochujang"], 1.8, 8.2, "s"),
      D("Tteokbokki", ["arroz", "chile", "salsa"], 1.2, 5.8, "s"),
      D("K-fried chicken", ["pollo", "chile", "miel"], 1.9, 8.6, "s"),
      D("Kimchi jjigae", ["kimchi", "cerdo", "tofu", "caldo"], 1.6, 7.4, "s"),
      D("Banchan extra", ["kimchi", "verdura"], 0.7, 3.2, "v"),
      D("Soju copa", ["licor", "hielo"], 1.4, 5.5, "a"),
    ],
    tailandesa: [
      D("Pad kra pao", ["carne_picada", "albahaca", "chile", "arroz", "huevo"], 1.7, 7.6, "s"),
      D("Tom yum", ["gamba", "lima", "chile", "caldo"], 1.8, 8.0, "s"),
      D("Mango sticky", ["arroz", "mango", "coco"], 1.0, 5.2, "v"),
      D("Satay pollo", ["pollo", "cacahuete", "especias"], 1.5, 6.8, ""),
      D("Som tam", ["papaya", "lima", "chile", "cacahuete"], 1.1, 5.6, "vs"),
      D("Thai iced tea", ["te", "leche", "hielo", "azucar"], 0.5, 3.2, "v"),
    ],
    libanesa: [
      D("Kibbeh", ["cordero", "trigo", "cebolla"], 1.8, 7.8, ""),
      D("Fattoush", ["ensalada", "pan", "sumac", "limon"], 1.0, 5.2, "v"),
      D("Manoushe zaatar", ["masa", "tomillo", "aceite"], 0.8, 4.0, "v"),
      D("Knafeh", ["queso", "azucar", "agua de azahar"], 1.2, 5.6, "v"),
    ],
    mediterránea: [
      D("Pescado plancha", ["merluza", "limon", "aceite"], 2.6, 12, ""),
      D("Ensalada griega plus", ["tomate", "pepino", "feta", "aceituna"], 1.3, 6.4, "v"),
      D("Hummus remolacha", ["garbanzo", "tahini"], 0.9, 4.8, "v"),
      D("Copa rosado", ["vino_blanco", "hielo"], 1.5, 6.2, "a"),
    ],
    griega: [
      D("Moussaka", ["berenjena", "carne_picada", "bechamel"], 2.0, 9.2, ""),
      D("Souvlaki cerdo", ["cerdo", "pita", "tzatziki"], 1.7, 7.4, ""),
      D("Saganaki", ["queso", "limon", "aceite"], 1.4, 6.6, "v"),
      D("Baklava nuez", ["almendra", "miel"], 0.9, 4.6, "v"),
      D("Ouzo", ["licor", "hielo", "agua"], 1.3, 5.4, "a"),
    ],
    vietnamita: [
      D("Bún chả", ["cerdo", "fideos", "hierbabuena", "lima"], 1.8, 7.8, ""),
      D("Gỏi cuốn", ["gamba", "fideos", "lechuga", "salsa"], 1.4, 6.2, ""),
      D("Cà phê sữa", ["cafe", "leche", "hielo"], 0.5, 3.1, "v"),
      D("Bánh mì tofu", ["pan", "tofu", "zanahoria", "cilantro"], 1.2, 5.5, "v"),
      D("Chè", ["coco", "azucar", "judias"], 0.7, 3.8, "v"),
    ],
    brasileña: [
      D("Picanha", ["ternera", "sal", "limon"], 3.4, 15, ""),
      D("Feijoada copa", ["judias", "cerdo", "arroz"], 1.8, 8.2, ""),
      D("Pão de queijo", ["queso", "almidon", "huevo"], 0.7, 3.6, "v"),
      D("Açaí bowl", ["fruta", "granola", "miel"], 1.2, 5.8, "v"),
      D("Caipirinha", ["licor", "lima", "azucar", "hielo"], 1.6, 7.2, "a"),
    ],
    parrilla: [
      D("Costillar", ["costilla", "salsa", "pimenton"], 2.8, 12.5, ""),
      D("Morcilla asada", ["cerdo", "especias"], 1.4, 6.4, ""),
      D("Ensalada criolla", ["tomate", "cebolla", "pimiento"], 0.8, 4.0, "v"),
    ],
    peruana: [
      D("Lomo saltado", ["ternera", "cebolla", "tomate", "soja", "patata"], 2.2, 9.6, ""),
      D("Causa lima", ["patata", "atun", "mayo", "lima"], 1.5, 6.8, ""),
      D("Anticuchos", ["ternera", "aji", "patata"], 1.8, 7.6, "s"),
      D("Suspiro limeño", ["leche", "azucar", "huevo"], 0.8, 4.2, "v"),
      D("Chicha morada", ["maiz", "pina", "canela"], 0.5, 2.8, "v"),
    ],
    británica: [
      D("Fish finger bap", ["bacalao", "pan", "tartara"], 1.6, 6.8, ""),
      D("Sunday roast mini", ["ternera", "patata", "salsa"], 2.8, 12, ""),
      D("Sticky toffee", ["azucar", "nata", "huevo"], 0.9, 4.8, "v"),
      D("Pint bitter", ["cerveza"], 0.9, 4.2, "a"),
      D("Mushy peas", ["guisante", "mantequilla"], 0.5, 2.6, "v"),
    ],
    pescado: [
      D("Calamares romana", ["calamar", "harina", "limon"], 1.6, 7.2, ""),
      D("Sopa marinera", ["caldo", "pescado", "azafran"], 1.8, 8.0, ""),
      D("Tartar salmón", ["salmon", "lima", "cebolla"], 2.4, 11, ""),
    ],
    barbacoa: [
      D("Brisket loncha", ["ternera", "especias", "salsa"], 2.6, 11.5, ""),
      D("Pulled pork bun", ["pan", "cerdo", "col", "salsa"], 1.8, 7.4, ""),
      D("Mac smoked", ["pasta", "cheddar", "bacon"], 1.3, 5.8, ""),
      D("Corn cob", ["maiz", "mantequilla"], 0.6, 3.2, "v"),
      D("Pecan pie", ["masa", "azucar", "almendra"], 1.0, 4.9, "v"),
    ],
    suiza: [
      D("Rösti", ["patata", "mantequilla"], 1.0, 5.4, "v"),
      D("Raclette plato", ["queso_raclette", "patata", "pepinillo"], 2.4, 12, "v"),
      D("Zürcher geschnetzeltes", ["ternera", "nata", "setas"], 2.8, 14, ""),
      D("Chocolate caliente", ["chocolate", "leche"], 0.7, 3.8, "v"),
    ],
    alpina: [
      D("Fondue extra queso", ["queso_gruyere", "vino_blanco"], 2.2, 11, "v"),
      D("Tartiflette", ["patata", "queso", "bacon", "nata"], 2.0, 9.8, ""),
      D("Glühwein", ["vino_tinto", "canela", "naranja"], 1.2, 5.2, "a"),
    ],
    polaca: [
      D("Bigos", ["chucrut", "cerdo", "chorizo"], 1.6, 7.2, ""),
      D("Żurek", ["caldo", "salchicha", "huevo"], 1.4, 6.4, ""),
      D("Sernik", ["queso", "huevo", "azucar"], 0.9, 4.6, "v"),
      D("Kompot", ["fruta", "azucar", "agua"], 0.3, 2.0, "v"),
    ],
    "del este": [
      D("Borsch", ["remolacha", "caldo", "nata"], 1.1, 5.4, "v"),
      D("Pierogi extra setas", ["masa_pierogi", "setas", "cebolla"], 1.3, 5.8, "v"),
      D("Vodka shot", ["vodka"], 1.2, 4.5, "a"),
    ],
    marroquí: [
      D("Harira", ["lenteja", "garbanzo", "tomate", "cilantro"], 1.1, 5.2, "v"),
      D("Briouat", ["masa", "almendra", "miel"], 0.9, 4.4, "v"),
      D("Té menta", ["te", "menta", "azucar"], 0.3, 2.2, "v"),
      D("Kefta tajine", ["carne_picada", "tomate", "huevo"], 1.8, 7.8, ""),
    ],
    magrebí: [
      D("Couscous verdura", ["sémola", "verdura", "garbanzo"], 1.4, 6.6, "v"),
      D("Mechoui mini", ["cordero", "especias"], 2.6, 11, ""),
      D("Makroud", ["datil", "sémola", "miel"], 0.7, 3.6, "v"),
    ],
    caribeña: [
      D("Rice and peas", ["arroz", "coco", "judias"], 1.0, 4.8, "v"),
      D("Plantain frito", ["platano_macho", "aceite"], 0.6, 3.4, "v"),
      D("Rum punch", ["ron", "pina", "naranja", "nuez moscada"], 1.7, 7.4, "a"),
      D("Festival pan", ["masa", "azucar"], 0.5, 2.8, "v"),
    ],
    "dim sum": [
      D("Har gow", ["gamba", "masa"], 1.6, 7.2, ""),
      D("Siu mai", ["cerdo", "gamba", "masa"], 1.5, 6.8, ""),
      D("Char siu bao", ["bao", "cerdo"], 1.3, 5.9, ""),
      D("Cheung fun", ["arroz", "soja"], 1.2, 5.6, "v"),
      D("Té pu-erh", ["te"], 0.3, 2.6, "v"),
    ],
    hawaiana: [
      D("Loco moco", ["arroz", "carne_picada", "huevo", "salsa"], 1.8, 7.6, ""),
      D("Spam musubi", ["arroz", "cerdo", "algas"], 1.2, 5.4, ""),
      D("Malasadas", ["masa", "azucar"], 0.7, 3.8, "v"),
      D("POG juice", ["pina", "naranja", "fruta"], 0.6, 3.2, "v"),
    ],
    poké: [
      D("Poke spicy mayo", ["arroz", "atun", "mayo", "chile"], 2.4, 11.5, "s"),
      D("Poke veggie", ["arroz", "tofu", "aguacate", "edamame"], 1.6, 8.2, "v"),
      D("Poke salmón mango", ["arroz", "salmon", "mango", "soja"], 2.2, 10.8, ""),
      D("Seaweed salad", ["algas_wakame", "sesamo"], 0.8, 4.4, "v"),
    ],
    nórdica: [
      D("Gravlax", ["salmon", "eneldo", "azucar", "sal"], 2.2, 11, ""),
      D("Köttbullar", ["carne_picada", "nata", "lingon"], 1.8, 8.4, ""),
      D("Kanelbulle", ["masa", "canela", "azucar"], 0.7, 3.9, "v"),
      D("Aquavit", ["licor", "hielo"], 1.6, 6.8, "a"),
      D("Smørrebrød arenque", ["pan", "pescado", "cebolla"], 1.5, 7.2, ""),
    ],
    mariscos: [
      D("Mariscada", ["gamba", "mejillon", "vieira"], 4.8, 22, ""),
      D("Navajas plancha", ["percebe", "ajo", "perejil"], 3.2, 16, ""),
      D("Tartar atún", ["atun", "soja", "lima"], 2.8, 14, ""),
      D("Copa albariño", ["vino_blanco"], 1.8, 7.5, "a"),
    ],
    cantonesa: [
      D("Char siu rice", ["arroz", "cerdo", "soja"], 1.7, 7.4, ""),
      D("Wonton noodle", ["fideos", "cerdo", "caldo"], 1.5, 6.8, ""),
      D("Mango pudding", ["mango", "leche", "azucar"], 0.8, 4.2, "v"),
    ],
    asador: [
      D("Chuletón 45 días", ["ternera", "sal"], 6.5, 32, "*"),
      D("Lechazo", ["cordero", "romero"], 4.2, 22, ""),
      D("Pimientos asados", ["pimiento", "aceite"], 0.9, 5.2, "v"),
      D("Copa ribera", ["vino_tinto"], 2.4, 8.5, "a"),
    ],
    carnes: [
      D("Tartar de vaca", ["ternera", "yema", "mostaza"], 3.2, 16, ""),
      D("Costilla baja", ["costilla", "sal"], 3.6, 18, ""),
    ],
    cócteles: [
      D("Negroni", ["ginebra", "vermut", "licor"], 2.4, 9.5, "a"),
      D("Daiquiri", ["ron", "lima", "azucar"], 1.8, 8.0, "a"),
      D("Espresso martini", ["vodka", "cafe", "licor"], 2.2, 9.2, "a"),
      D("Mojito", ["ron", "menta", "lima", "azucar", "hielo"], 1.7, 7.8, "a"),
      D("Old fashioned", ["whisky", "azucar", "naranja"], 2.3, 9.8, "a"),
      D("Mocktail hibisco", ["te", "lima", "azucar", "hielo"], 0.6, 4.2, "v"),
      D("Aceitunas & mix", ["aceituna", "almendra"], 0.8, 4.5, "v"),
    ],
    vinos: [
      D("Copa crianza", ["vino_tinto"], 1.8, 6.5, "a"),
      D("Copa albariño", ["vino_blanco"], 1.7, 6.4, "a"),
      D("Tabla quesos 3", ["queso", "pan", "miel"], 2.2, 9.5, "v"),
      D("Anchoas cantábrico", ["anchoa", "pan", "mantequilla"], 1.8, 8.2, ""),
      D("Vermú grifo", ["vermut", "naranja", "hielo"], 1.3, 5.4, "a"),
    ],
    cerveza: [
      D("Pinta lager", ["cerveza"], 0.8, 3.8, "a"),
      D("Pinta IPA", ["cerveza"], 0.9, 4.4, "a"),
      D("Fligth 4", ["cerveza"], 1.6, 7.2, "a"),
      D("Pretzel & mostaza", ["masa", "mostaza"], 0.7, 3.5, "v"),
      D("Sausage roll", ["masa", "cerdo"], 1.2, 5.2, ""),
    ],
    pub: [
      D("Fish pie", ["pescado", "patata", "leche"], 2.0, 8.8, ""),
      D("Scotch egg", ["huevo", "cerdo", "pan"], 1.3, 5.6, ""),
      D("Sticky ribs", ["costilla", "salsa"], 2.1, 9.0, ""),
    ],
    whisky: [
      D("Single malt 12", ["whisky"], 3.2, 11, "a"),
      D("Highball jengibre", ["whisky", "jengibre", "hielo"], 1.8, 7.6, "a"),
      D("Whisky sour", ["whisky", "limon", "azucar", "huevo"], 2.0, 8.8, "a"),
      D("Tabla ahumados", ["salmon", "queso", "pan"], 2.4, 10.5, ""),
      D("Chocolate 70%", ["chocolate"], 0.8, 4.2, "v"),
    ],
    café: [
      D("Flat white", ["cafe", "leche"], 0.5, 3.2, "v"),
      D("Cold brew", ["cafe", "hielo"], 0.45, 3.4, "v"),
      D("Croissant almendra", ["croissant", "almendra"], 0.8, 3.9, "v"),
      D("Cheesecake", ["queso", "azucar", "galleta"], 1.0, 4.8, "v"),
      D("Irish coffee", ["cafe", "whisky", "nata"], 1.4, 6.2, "a"),
    ],
    licores: [
      D("Licor café", ["licor", "hielo"], 1.3, 5.5, "a"),
      D("Carajillo", ["cafe", "brandy"], 1.2, 5.2, "a"),
    ],
    tequila: [
      D("Margarita spicy", ["tequila", "lima", "chile", "hielo"], 1.9, 8.4, "as"),
      D("Paloma", ["tequila", "pomelo", "soda"], 1.6, 7.2, "a"),
      D("Tequila flight", ["tequila"], 3.4, 14, "a"),
      D("Elote cup", ["maiz", "mayo", "chile"], 0.8, 4.0, "v"),
    ],
    mezcal: [
      D("Mezcal neat", ["mezcal"], 2.6, 9.5, "a"),
      D("Oaxacan old fashioned", ["mezcal", "azucar", "naranja"], 2.4, 10, "a"),
    ],
    champán: [
      D("Copa brut", ["cava"], 3.2, 11, "a"),
      D("Kir imperial", ["cava", "licor"], 3.6, 13, "a"),
      D("Ostras 6", ["ostra", "limon"], 4.8, 22, ""),
      D("Blini caviar", ["masa", "caviar", "nata"], 6.2, 28, ""),
      D("Macaron 3", ["almendra", "azucar", "huevo"], 1.4, 7, "v"),
    ],
    ron: [
      D("Dark'n'stormy", ["ron", "jengibre", "lima"], 1.7, 7.6, "a"),
      D("Piña colada", ["ron", "pina", "coco"], 1.8, 8.0, "a"),
      D("Aged rum neat", ["ron"], 2.4, 9.2, "a"),
      D("Ceviche copa", ["pescado", "lima", "cebolla"], 2.0, 9.0, ""),
    ],
    tiki: [
      D("Zombie", ["ron", "limon", "licor"], 2.6, 10.5, "a"),
      D("Mai tai", ["ron", "lima", "almendra"], 2.2, 9.4, "a"),
      D("Coco shrimp", ["gamba", "coco", "aceite"], 2.0, 8.8, ""),
    ],
    vermutería: [
      D("Vermú rojo grifo", ["vermut", "naranja", "hielo"], 1.2, 4.8, "a"),
      D("Vermú blanco", ["vermut", "limon"], 1.2, 4.8, "a"),
      D("Gilda", ["aceituna", "anchoa", "guindilla"], 0.9, 4.2, ""),
      D("Conserva sardinilla", ["pescado", "pan", "aceite"], 1.4, 6.0, ""),
      D("Patatas alioli", ["patata", "ajo", "mayo"], 0.7, 3.6, "v"),
    ],
    absenta: [
      D("Absenta drip", ["absenta", "azucar", "agua"], 2.8, 9.5, "a*"),
      D("Corpse #2", ["ginebra", "licor", "absenta", "limon"], 2.6, 10, "a"),
      D("Chocolate & sal", ["chocolate", "sal"], 0.9, 4.6, "v"),
    ],
    wok: [
      D("Chow mein", ["noodles", "verdura", "soja"], 1.4, 6.8, "v"),
      D("Ternera wok", ["ternera", "pimiento", "soja"], 2.0, 8.6, "s"),
    ],
    pasta: [
      D("Aglio e olio", ["pasta", "ajo", "aceite"], 1.1, 6.2, "v"),
      D("Arrabbiata", ["pasta", "tomate", "chile"], 1.3, 6.8, "vs"),
    ],
    cubana: [
      D("Ropa vieja", ["ternera", "tomate", "pimiento"], 2.0, 9.4, ""),
      D("Moros y cristianos", ["arroz", "judias"], 1.0, 5.2, "v"),
      D("Mojito", ["ron", "menta", "lima", "azucar"], 1.6, 7.2, "a"),
    ],
    diner: [
      D("Patty melt", ["pan", "carne_picada", "cebolla", "cheddar"], 1.8, 8.2, ""),
      D("Root beer float", ["soda", "leche"], 0.6, 3.8, "v"),
    ],
    vegetariana: [
      D("Hamburguesa vegetal", ["pan_burger", "tofu", "lechuga"], 1.4, 7.2, "v"),
      D("Lasaña verdura", ["pasta", "verdura", "ricotta"], 1.7, 8.8, "v"),
    ],
    ensaladas: [
      D("Bowl garbanzo", ["garbanzo", "lechuga", "tomate"], 1.2, 6.4, "v"),
      D("Wrap falafel", ["pita", "garbanzo", "tahini"], 1.3, 6.6, "v"),
    ],
    brunch: [
      D("Shakshuka", ["huevo", "tomate", "pimiento"], 1.4, 8.2, "v"),
      D("Banana bread", ["platano", "masa", "azucar"], 0.8, 4.4, "v"),
    ],
    desayunos: [
      D("Tostada mantequilla", ["pan", "mantequilla", "mermelada"], 0.5, 3.2, "v"),
      D("Café con leche", ["cafe", "leche"], 0.4, 2.6, "v"),
    ],
    postres: [
      D("Coulant", ["chocolate", "huevo", "azucar"], 1.1, 5.8, "v"),
      D("Tarta queso", ["queso", "azucar", "galleta"], 1.0, 5.4, "v"),
      D("Helado 2 bolas", ["leche", "azucar"], 0.7, 3.8, "v"),
    ],
    chocolate: [
      D("Fondue chocolate", ["chocolate", "fruta"], 1.6, 7.2, "v"),
      D("Chocolate 70%", ["chocolate"], 0.8, 4.4, "v"),
    ],
    heladería: [
      D("Coppa mista", ["leche", "azucar", "fruta"], 1.1, 5.2, "v"),
      D("Granita limón", ["limon", "azucar", "hielo"], 0.5, 3.4, "v"),
    ],
    banquetes: [
      D("Mesa de quesos", ["queso", "pan", "miel"], 2.4, 9.8, "v"),
      D("Solomillo banquetes", ["ternera", "sal"], 4.2, 18, ""),
    ],
    "food hall": [
      D("Street bao", ["bao", "cerdo"], 1.4, 6.5, ""),
      D("Street ramen", ["fideos", "caldo"], 1.8, 8.2, ""),
    ],
    internacional: [
      D("Steak frites", ["ternera", "patata"], 3.4, 16, ""),
      D("Ceviche copa", ["pescado", "lima", "cebolla"], 2.2, 11, ""),
    ],
  };

  const FOOD_COMMON = [
    D("Agua de la casa", ["agua"], 0.05, 1.6, "v"),
    D("Refresco", ["soda", "hielo"], 0.2, 2.4, "v"),
    D("Café solo", ["cafe"], 0.25, 1.8, "v"),
    D("Ensalada verde", ["lechuga", "tomate", "aceite"], 0.6, 3.8, "v"),
    D("Postre del día", ["azucar", "huevo", "leche"], 0.7, 4.2, "v"),
    D("Pan y dip", ["pan", "aceite"], 0.3, 2.2, "v"),
    D("Tabla sharing", ["queso", "pan", "aceituna"], 1.6, 7.4, "v"),
    D("Helado vainilla", ["leche", "vainilla", "azucar"], 0.5, 3.5, "v"),
  ];
  const BAR_COMMON = [
    D("Agua con gas", ["agua", "hielo"], 0.08, 2.2, "v"),
    D("Frutos secos", ["almendra", "sal"], 0.5, 3.4, "v"),
    D("Aceitunas", ["aceituna", "aceite"], 0.4, 3.0, "v"),
    D("Copa del mes", ["vino_tinto"], 1.6, 6.0, "a"),
    D("Mocktail cítrico", ["limon", "naranja", "azucar", "hielo"], 0.5, 4.0, "v"),
    D("Chocolate negro", ["chocolate"], 0.6, 3.8, "v"),
  ];

  function addAll(b, list) {
    const have = new Set(b.dishes.map((d) => d.name));
    for (const d of list || []) {
      if (!d || have.has(d.name)) continue;
      b.dishes.push({
        name: d.name,
        ings: d.ings.slice(),
        cost: d.cost,
        price: d.price || Math.max(2.5, +(d.cost * 4.2).toFixed(1)),
        veg: !!d.veg,
        alc: !!d.alc,
        spicy: !!d.spicy,
        sig: !!d.sig,
      });
      have.add(d.name);
    }
  }

  for (const b of BRAND.list) {
    for (const c of b.cuisines) addAll(b, PACKS[c]);
    if (b.tier === "bar") addAll(b, BAR_COMMON);
    else addAll(b, FOOD_COMMON);
    if (b.tier === "luxury") addAll(b, PACKS["alta cocina"]);
    if (b.tier === "fast_food") {
      addAll(b, [
        D("Menú infantil", ["pan", "pollo", "ketchup"], 1.1, 4.4, ""),
        D("Extra salsa", ["salsa"], 0.15, 0.8, "v"),
        D("Batido fresa", ["leche", "azucar", "fruta"], 0.6, 3.4, "v"),
      ]);
    }
  }

  BRAND.normalizeMenus();
  BRAND.cuisines.splice(0, BRAND.cuisines.length, ...[...new Set(BRAND.list.flatMap((b) => b.cuisines))].sort((a, b) => a.localeCompare(b, "es")));
})();
