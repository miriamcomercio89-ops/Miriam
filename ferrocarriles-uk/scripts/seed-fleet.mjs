/**
 * Catálogo amplio de material rodante (cientos de unidades).
 * Incluye refs Workshop reales/orientativas + variantes de composición/livrea.
 */

const baseUnits = [
  // —— Alta velocidad / larga distancia ——
  ["ice4_k1n", "ICE 4 K1n", "DE MU ICE 4 K1n", "alta_velocidad", 265, 456, ["av", "ld", "px"]],
  ["ice4_k3s", "ICE 4 K3s", "DE MU ICE 4 K3s", "alta_velocidad", 265, 724, ["av", "ld", "px"]],
  ["ice4_k4s", "ICE 4 K4s", "DE MU ICE 4 K4s", "alta_velocidad", 265, 830, ["av", "ld"]],
  ["ice3", "ICE 3", "DE MU ICE 3", "alta_velocidad", 330, 462, ["av", "ld"]],
  ["ice3_velaro", "ICE 3 Velaro D", "DE MU ICE 3 Velaro D", "alta_velocidad", 330, 460, ["av", "px"]],
  ["ice2", "ICE 2", "DE MU ICE 2", "alta_velocidad", 280, 418, ["av", "ld"]],
  ["ice1", "ICE 1", "DE MU ICE 1", "alta_velocidad", 280, 680, ["av", "ld"]],
  ["icet", "ICE T", "DE MU ICE T", "alta_velocidad_basculante", 230, 350, ["ld", "px", "ir"]],
  ["icetd", "ICE TD", "DE MU ICE TD", "alta_velocidad_diesel", 200, 250, ["ld", "ir"]],
  ["tgv_se", "TGV Sud-Est", "FR MU TGV Sud-Est", "alta_velocidad", 270, 350, ["av"]],
  ["tgv_atl", "TGV Atlantique", "FR MU TGV Atlantique", "alta_velocidad", 300, 485, ["av", "ld"]],
  ["tgv_reseau", "TGV Réseau", "FR MU TGV Réseau", "alta_velocidad", 320, 377, ["av", "ld"]],
  ["tgv_duplex", "TGV Duplex", "FR MU TGV Duplex", "alta_velocidad", 320, 510, ["av", "ld"]],
  ["tgv_euroduplex", "TGV EuroDuplex", "FR MU TGV EuroDuplex", "alta_velocidad", 320, 550, ["av", "ld"]],
  ["tgv_pos", "TGV POS", "FR MU TGV POS", "alta_velocidad", 320, 360, ["av"]],
  ["thalys_pbka", "Thalys PBKA", "FR MU Thalys PBKA", "alta_velocidad_internacional", 300, 380, ["av", "ld"]],
  ["thalys_pba", "Thalys PBA", "FR MU Thalys PBA", "alta_velocidad_internacional", 300, 377, ["av", "ld"]],
  ["thalys_izy", "Thalys TMST Izy", "FR MU Thalys TMST Izy", "alta_velocidad_internacional", 300, 750, ["av", "px"]],
  ["eurostar_e320", "Eurostar e320", "UK MU Eurostar e320", "alta_velocidad_internacional", 320, 902, ["av", "ld"]],
  ["eurostar_e300", "Eurostar e300", "UK MU Eurostar e300", "alta_velocidad_internacional", 300, 750, ["av", "ld"]],
  ["giruno", "Stadler Giruno", "CH MU RABe 501 Giruno", "alta_velocidad", 250, 400, ["av", "ld"]],
  ["pendolino_ch", "Pendolino New CH", "CH MU RABe 503 New Pendolino", "basculante", 250, 430, ["ld", "px"]],
  ["icn", "ICN", "CH MU RABDe 500 ICN", "basculante", 200, 450, ["ld", "ir"]],
  ["ave_s103", "AVE S-103 Velaro E", "ES MU AVE S-103 Velaro E", "alta_velocidad", 350, 404, ["av", "px"]],
  ["ave_s102", "AVE S-102", "ES MU AVE S-102 Duck", "alta_velocidad", 330, 318, ["av"]],
  ["ave_s112", "AVE S-112", "ES MU AVE S-112 'Duck'", "alta_velocidad", 330, 365, ["av", "ld"]],
  ["ave_s100", "AVE S-100", "ES MU AVE S-100", "alta_velocidad", 300, 329, ["av"]],
  ["alvia_730", "Alvia S-730", "ES MU Alvia S-730 'Duckling'", "basculante", 250, 270, ["ld", "px"]],
  ["alvia_130", "Alvia S-130", "ES MU Alvia S-130 'Duckling'", "basculante", 250, 299, ["ld", "ir"]],
  ["alvia_120", "Alvia S-120/121", "ES MU Alvia S-120/121 Sepia", "basculante", 250, 237, ["ld", "ir"]],
  ["avant_114", "Avant S-114", "ES MU Avant S-114 New Pendolino", "basculante", 250, 236, ["ld", "ir"]],
  ["etr500", "ETR 500 Frecce", "IT MU Le Frecce ETR 500", "alta_velocidad", 300, 590, ["av", "ld"]],
  ["etr600", "ETR 600 Pendolino", "IT MU Le Frecce ETR 600 New Pendolino", "basculante", 250, 432, ["ld", "px"]],
  ["etr700", "ETR 700 Frecce", "IT MU Le Frecce ETR 700", "alta_velocidad", 250, 500, ["av", "ld"]],
  ["etr1000", "ETR1000 Frecciarossa", "ETR1000 / Frecciarossa 1000", "alta_velocidad", 300, 460, ["av", "px"]],
  ["ic4", "IC4 Litra MG", "DK MU Litra MG IC4", "larga_distancia", 200, 375, ["ld", "ir"]],
  ["railjet", "Railjet Viaggio Comfort", "AT Coach Viaggio Comfort", "larga_distancia", 230, 400, ["ld", "n", "px"]],
  ["viaggio_twin", "Viaggio Twin", "AT Coach Viaggio Twin", "doble_piso", 230, 480, ["ld", "ir"]],
  ["talgo_vi", "Talgo VI", "ES Coach Talgo VI", "larga_distancia", 200, 220, ["ld", "n"]],
  ["talgo_iv", "Talgo IV/V", "ES Coach Talgo IV/V", "larga_distancia", 200, 200, ["ld", "n"]],
  ["corail_nuit", "Corail Nuit", "FR Coach Corail Nuit", "nocturno", 160, 200, ["n"]],
  ["tee_pba", "TEE PBA", "FR Coach TEE PBA", "larga_distancia", 200, 180, ["ld", "tur"]],
  ["ew_iv", "EW IV", "CH Coach EW IV", "larga_distancia", 200, 160, ["ld", "ir"]],
  ["uic_z1", "UIC-Z1", "AT Coach UIC-Z1 1989", "larga_distancia", 200, 160, ["ld", "n"]],
  ["ic_901", "IC 901", "IT Coach IC 901", "larga_distancia", 200, 160, ["ld"]],
  ["loc_br101", "Loc BR 101 + coches", "DE Loc BR 101", "locomotora", 200, 400, ["ld", "ir", "n"]],
  ["loc_br103", "Loc BR 103.1 + coches", "DE Loc BR 103.1", "locomotora", 200, 400, ["ld", "tur"]],
  ["loc_br193", "Vectron BR 193 + coches", "DE Loc BR 193", "locomotora", 200, 450, ["ld", "ir", "n"]],
  ["loc_br147", "Traxx BR 147 + coches", "DE Loc BR 147", "locomotora", 160, 400, ["ir", "re"]],
  ["loc_e186", "Traxx E 186 + coches", "NL Loc E 186", "locomotora", 160, 400, ["ld", "ir"]],
  ["loc_e193", "Vectron E 193 + coches", "NL Loc E 193", "locomotora", 200, 450, ["ld", "px"]],
  ["loc_hle18", "HLE 18 + coches", "BE Loc HLE 18", "locomotora", 200, 400, ["ld", "ir"]],
  ["loc_hle13", "HLE 13 + coches", "BE Loc HLE 13", "locomotora", 200, 380, ["ld", "ir"]],
  ["m7_emu", "M7 EMU", "BE Coach / EMU M7", "doble_piso", 200, 500, ["ir", "re", "s"]],
  ["dosto5", "Dosto 5ª gen IC Twindexx", "DE Coach Dosto (5th Gen) IC Twindexx Vario", "doble_piso", 190, 550, ["ld", "ir", "re"]],
  ["dosto4", "Dosto 4ª gen", "DE Coach Dosto (4th Gen)", "doble_piso", 160, 500, ["re", "s", "ir"]],
  ["twindexx_ch", "Twindexx Swiss Express", "CH MU RABe 502 Twindexx Swiss Express", "doble_piso", 200, 550, ["ld", "ir", "re"]],
  ["twindexx_vario", "Twindexx Vario BR 445", "DE Coach / EMU BR 445 Twindexx Vario", "doble_piso", 160, 500, ["re", "s"]],
  ["kiss200", "KISS 200", "DE MU BR 4010 KISS 200", "doble_piso", 200, 600, ["ld", "ir", "re", "s"]],
  ["kiss200_at", "KISS 200 Austria", "AT MU Rh 4010 KISS 200", "doble_piso", 200, 600, ["ld", "ir", "re"]],
  ["kiss160", "KISS 160", "CH MU RABe 511 KISS 160", "cercanias", 160, 550, ["s", "re"]],
  ["kiss160_lu", "KISS 160 Luxemburgo", "LU MU Series 2300 KISS 160", "cercanias", 160, 500, ["s", "re"]],
  ["virm", "VIRM", "NL MU VIRM", "doble_piso", 160, 500, ["re", "ir", "s"]],
  ["regio2n_prem", "Regio 2N Omneo Premium", "FR MU Z 55500 Regio 2N Omneo Premium", "doble_piso", 200, 400, ["re", "ir", "ld"]],
  ["regio2n_reg", "Regio 2N Regional", "FR MU Z 55500 Regio 2N Regional", "doble_piso", 160, 420, ["re", "rb"]],
  ["regio2n_cap", "Regio 2N Gran Capacidad", "FR MU Z 55500 Regio 2N Grand Capacity", "doble_piso", 160, 520, ["s", "re"]],
  ["z2n", "Z2N", "FR MU Z 5600/8800 Z2N", "doble_piso", 140, 450, ["s"]],
  ["z24500", "Z 24500 2N NG", "FR MU Z 24500 2N NG", "cercanias", 140, 450, ["s"]],
  ["mi2n_alteo", "MI2N Altéo", "FR MU Z 1500 MI2N Altéo", "cercanias", 140, 500, ["s", "or"]],
  ["mi2n_eole", "MI2N Eole", "FR MU Z 22500 MI2N Eole", "cercanias", 140, 500, ["s"]],
  ["mi09", "MI09", "FR MU Z 1600 MI09", "cercanias", 120, 500, ["s", "u"]],
  ["mi79", "MI79", "FR MU Z 8100 MI79", "cercanias", 100, 450, ["s"]],
  ["mi84", "MI84", "FR MU Z 8400 MI84", "cercanias", 100, 450, ["s"]],
  ["francilien", "Francilien Z 50000", "FR MU Z 50000 Francilien", "cercanias", 140, 500, ["s", "or"]],
  ["dpz", "DPZ/HVZ", "CH Coach / EMU DPZ/HVZ", "cercanias", 140, 480, ["s"]],

  // —— Regionales alemanes / europeos ——
  ["flirt4", "FLIRT 4", "Stadler FLIRT 4 (D)EMU", "regional", 160, 300, ["re", "rb", "ir", "s"]],
  ["flirt3_2d", "FLIRT 3 (2 puertas)", "NL MU FLIRT 3 (2 doors)", "regional", 160, 280, ["re", "rb", "s"]],
  ["flirt3_1d", "FLIRT 3 (1 puerta)", "NL MU FLIRT 3 (1 door)", "regional", 160, 260, ["re", "rb"]],
  ["flirt3_xl", "FLIRT 3 XL BR 3427", "DE MU BR 3427/3428/3429 Flirt 3 XL", "regional", 160, 350, ["re", "ir", "s"]],
  ["flirt3_de", "FLIRT 3 BR 1428", "DE MU BR 1428 Flirt 3", "regional", 160, 280, ["re", "rb"]],
  ["flirt_br429", "FLIRT BR 429", "DE MU BR 429 FLIRT", "regional", 160, 250, ["re", "rb"]],
  ["flirt_ch524", "FLIRT RABe 524", "CH MU RABe 524 FLIRT", "regional", 160, 260, ["re", "rb"]],
  ["flirt_ch522", "FLIRT RABe 522/523", "CH MU RABe 522/523 FLIRT", "regional", 160, 260, ["re", "rb"]],
  ["flirt_it", "FLIRT ETR 155/170", "IT MU ETR 155 / 170 FLIRT", "regional", 160, 250, ["re", "rb"]],
  ["wink", "FLIRT WINK", "NL MU FLIRT WINK", "regional_hibrido", 140, 150, ["rb", "rl"]],
  ["gtw_e_nl", "GTW Eléctrico NL", "NL MU GTW Electric", "regional_ligero", 140, 150, ["rb", "rl"]],
  ["gtw_d_nl", "GTW Diésel NL", "NL MU GTW Diesel", "regional_ligero", 140, 140, ["rb", "rl", "tur"]],
  ["gtw_e_at", "GTW Eléctrico AT", "AT MU Rh 4062 GTW Electric", "regional_ligero", 140, 150, ["rb", "rl"]],
  ["gtw_d_at", "GTW Diésel AT", "AT MU Rh 5063 GTW Diesel", "regional_ligero", 140, 140, ["rb", "rl"]],
  ["gtw_ch520", "GTW RABe 520", "CH MU RABe 520 GTW", "regional_ligero", 140, 140, ["rb", "rl"]],
  ["gtw_ch526", "GTW RABe 526.2", "CH MU RABe 526.2 GTW", "regional_ligero", 140, 160, ["rb", "re"]],
  ["desiro_ml4746", "Desiro ML 4746", "AT MU Rh 4746 Desiro ML", "regional", 160, 300, ["re", "rb", "s"]],
  ["desiro_ml4744", "Desiro ML 4744", "AT MU Rh 4744 Desiro ML", "regional", 160, 280, ["re", "rb"]],
  ["desiro_classic_at", "Desiro Classic AT", "AT MU Rh 5022 Desiro Classic", "regional", 120, 150, ["rb", "rl"]],
  ["desiro_classic_de", "Desiro Classic BR 642", "DE MU BR 642 Desiro Classic", "regional", 120, 150, ["rb", "rl"]],
  ["desiro_classic_dk", "Desiro Classic DK", "DK MU Litra MQ Desiro Classic", "regional", 120, 150, ["rb", "rl"]],
  ["desiro_dd", "Desiro Doble Piso", "CH MU RABe 514 Desiro Double Deck", "cercanias", 140, 500, ["s", "re"]],
  ["talent_4024", "Talent 4024", "AT MU Rh 4024 Talent", "regional", 140, 180, ["rb", "rl", "tt"]],
  ["talent_643", "Talent BR 643", "DE MU BR 643 Talent", "regional", 120, 160, ["rb", "rl"]],
  ["talent_644", "Talent BR 644", "DE MU BR 644 Talent", "regional", 120, 180, ["rb", "rl"]],
  ["talent2", "Talent 2 BR 442", "DE MU BR 442 Talent 2", "regional", 160, 250, ["re", "rb", "s"]],
  ["mireo", "Mireo BR 463", "DE MU BR 463 Mireo (1 + 1 door)", "regional", 160, 280, ["re", "rb", "s"]],
  ["regio_shuttle", "Regio-Shuttle BR 650", "DE MU BR 650 Regio-Shuttle", "regional_ligero", 120, 120, ["rb", "rl"]],
  ["lint41_nl", "LINT 41H", "NL MU LINT 41H", "regional_diesel", 120, 120, ["rb", "rl"]],
  ["lint41_648", "LINT 41 BR 648", "DE MU BR 648 Coradia Lint 41", "regional_diesel", 120, 120, ["rb", "rl"]],
  ["lint41_623", "LINT 41 BR 623", "DE MU BR 623 Coradia Lint 41", "regional_diesel", 120, 120, ["rb", "rl"]],
  ["lint54", "LINT 54/81 BR 620/622", "DE MU BR 620 Coradia Lint 81 / BR 622 Coradia Lint 54", "regional_diesel", 140, 180, ["re", "rb"]],
  ["lint27", "LINT 27 BR 640", "DE MU BR 640 Coradia Lint 27", "regional_diesel", 120, 90, ["rl", "rb"]],
  ["coradia_cont_440", "Coradia Continental BR 440", "DE MU BR 440 Coradia Continental (1 door)", "regional", 160, 250, ["re", "rb", "s"]],
  ["coradia_cont_1440_0", "Coradia Continental BR 1440.0", "DE MU BR 1440.0 Coradia Continental", "regional", 160, 250, ["re", "rb"]],
  ["coradia_cont_1440_1", "Coradia Continental BR 1440.1", "DE MU BR 1440.1 Coradia Continental", "regional", 160, 260, ["re", "rb", "s"]],
  ["coradia_cont_1440_2", "Coradia Continental BR 1440.2", "DE MU BR 1440.2 Coradia Continental", "regional", 160, 270, ["re", "s"]],
  ["coradia_cont_1440_3", "Coradia Continental BR 1440.3", "DE MU BR 1440.3 Coradia Continental", "regional", 160, 280, ["re", "ir"]],
  ["coradia_nordic", "Coradia Nordic", "Alstom Coradia Nordic", "cercanias", 160, 250, ["s", "re", "rb"]],
  ["coradia_ater", "Coradia A TER BR 641", "DE MU BR 641 Coradia A TER", "regional_ligero", 120, 110, ["rb", "rl"]],
  ["civity", "CAF Civity", "BR Class 397 Civity", "intercity", 200, 300, ["ld", "ir", "re"]],
  ["civia", "Cercanías Civia", "ES MU Cercanias Civia", "cercanias", 120, 250, ["s", "rb"]],
  ["md_599", "MD S-599", "ES MU MD S-599", "regional_diesel", 160, 200, ["re", "rb"]],
  ["md_449", "MD S-449", "ES MU MD S-449", "regional", 160, 230, ["re", "rb"]],
  ["regiolis_reg", "Régiolis Regional", "FR MU B 84500 Régiolis Regional", "regional", 160, 220, ["re", "rb"]],
  ["regiolis_ic", "Régiolis Intercity", "FR MU B 85000 Régiolis Intercity", "regional", 160, 280, ["ir", "re"]],
  ["regiolis_sub", "Régiolis Suburban", "FR MU B 83500 Régiolis Suburban", "cercanias", 140, 250, ["s", "re"]],
  ["regiolis_leman", "Régiolis Léman Express", "FR MU Z 31500 Régiolis Léman Express", "cercanias", 140, 250, ["s", "re"]],
  ["agc_b82500", "AGC B 82500", "FR MU B 82500 AGC", "regional", 160, 200, ["re", "rb"]],
  ["agc_z27500", "AGC Z 27500", "FR MU Z 27500 AGC", "regional", 160, 200, ["re", "rb"]],
  ["agc_x76500", "AGC X 76500", "FR MU X 76500 AGC", "regional_diesel", 160, 180, ["rb", "rl"]],
  ["xter", "X TER X 72500", "FR MU X 72500 X TER", "regional_diesel", 160, 180, ["re", "rb"]],
  ["zter", "Z TER Z 21500", "FR MU Z 21500 Z TER", "regional", 200, 220, ["re", "ir"]],
  ["z2", "Z2 Z 11500", "FR MU Z 11500 Z2", "regional", 160, 180, ["rb", "re"]],
  ["ater_x73500", "A TER X 73500", "FR MU X 73500 A TER", "regional_ligero", 140, 100, ["rl", "rb"]],
  ["npz_domino", "NPZ Domino", "CH MU RBDe 560 NPZ Domino", "regional", 140, 200, ["rb", "re"]],
  ["npz_colibri", "NPZ Colibri", "CH MU RBDe 560 NPZ Colibri", "regional", 140, 200, ["rb", "re"]],
  ["rh5147", "Rh 5147", "AT MU Rh 5147", "regional_diesel", 120, 120, ["rb", "rl"]],
  ["rh5047", "Rh 5047", "AT MU Rh 5047", "regional_diesel", 120, 110, ["rl", "rb"]],
  ["rh4020", "Rh 4020", "AT MU Rh 4020", "cercanias", 120, 250, ["s", "rb"]],
  ["pop_etr103", "ETR 103 POP", "IT MU ETR 103 POP", "regional", 160, 280, ["re", "rb"]],
  ["lu_2000", "Series 2000 LU", "LU MU Series 2000", "regional", 140, 200, ["re", "rb"]],
  ["lu_2200", "Series 2200 LU", "LU MU Series 2200", "regional", 160, 250, ["re", "s"]],
  ["ms70", "MS70/AM70 Airport", "BE MU MS70/AM70 Airport", "cercanias", 140, 220, ["ae", "s"]],

  // —— Cercanías alemanas S-Bahn ——
  ["br423", "BR 423 S-Bahn", "DE MU BR 423", "cercanias", 140, 450, ["s", "or"]],
  ["br422", "BR 422 S-Bahn", "DE MU BR 422", "cercanias", 140, 450, ["s"]],
  ["br424", "BR 424 S-Bahn", "DE MU BR 424", "cercanias", 140, 400, ["s"]],
  ["br425", "BR 425 Regional/S", "DE MU BR 425", "cercanias", 140, 350, ["s", "re", "rb"]],
  ["br426", "BR 426", "DE MU BR 426", "cercanias", 140, 200, ["rb", "s"]],
  ["br430", "BR 430 S-Bahn", "DE MU BR 430", "cercanias", 140, 480, ["s", "or"]],
  ["br472", "BR 472 S-Bahn HH", "DE MU BR 472", "cercanias", 100, 400, ["s"]],
  ["br474", "BR 474 S-Bahn HH", "DE MU BR 474", "cercanias", 100, 420, ["s"]],
  ["br480", "BR 480 S-Bahn BE", "DE MU BR 480", "cercanias", 100, 400, ["s"]],
  ["br481", "BR 481 S-Bahn BE", "DE MU BR 481", "cercanias", 100, 450, ["s", "or"]],
  ["br483", "BR 483/484 S-Bahn BE", "DE MU BR 483/484", "cercanias", 100, 500, ["s", "or", "mc"]],
  ["br485", "BR 485 S-Bahn BE", "DE MU BR 485", "cercanias", 100, 400, ["s"]],
  ["br490", "BR 490 S-Bahn HH", "DE MU BR 490", "cercanias", 140, 480, ["s", "ae"]],
  ["br490_3", "BR 490.3 S-Bahn HH", "DE MU BR 490.3", "cercanias", 140, 500, ["s", "or"]],
  ["stog_sa", "S-tog SA/SE", "DK MU S-tog Litra SA / SE", "cercanias", 120, 450, ["s", "or"]],

  // —— Metro ——
  ["metro_mx3000", "Metro MX3000", "NO Metro MX3000 (Oslo T-Bane)", "metro", 80, 700, ["u"]],
  ["metro_mx_be", "Metro MIVB Mx", "BE Metro MIVB/STIB Mx", "metro", 80, 700, ["u"]],
  ["metro_mp89", "Metro MP89", "Paris Metro MP 89", "metro", 80, 700, ["u"]],
  ["metro_mp05", "Metro MP05", "Paris Metro MP 05", "metro", 80, 720, ["u"]],
  ["metro_mf01", "Metro MF01", "Paris Metro MF 01", "metro", 70, 650, ["u"]],

  // —— Tranvía / tram-train ——
  ["citadis_401", "Citadis 401", "Alstom Citadis 401", "tranvia", 70, 256, ["t"]],
  ["citadis_402", "Citadis 402", "Alstom Citadis 402", "tranvia", 70, 319, ["t", "tt"]],
  ["citadis_502", "Citadis 502", "Alstom Citadis 502", "tranvia", 70, 300, ["t"]],
  ["flexity", "Flexity", "Bombardier Flexity", "tranvia", 70, 250, ["t", "tt"]],
  ["flexity_classic", "Flexity Classic NGT6", "Bombardier Flexity Classic NGT6-2", "tranvia", 70, 220, ["t"]],
  ["flexity_swift", "Flexity Swift A32", "SE Tram SL A32 Bombardier Flexity Swift Stockholm", "tranvia", 80, 280, ["t", "tt"]],
  ["urbos", "CAF Urbos A35/A36", "SE Tram SL A35/A36 CAF Urbos Stockholm", "tranvia", 70, 280, ["t"]],
  ["albatros", "Tram Albatros", "BE Tram De Lijn Albatros", "tranvia", 70, 250, ["t"]],
  ["hermelijn", "Tram Hermelijn", "BE Tram De Lijn Hermelijn", "tranvia", 70, 220, ["t"]],
  ["pcc7700", "PCC 7700", "BE Tram MIVB/STIB PCC 7700", "tranvia", 60, 180, ["t"]],
  ["pcc7900", "PCC 7900", "BE Tram MIVB/STIB PCC 7900", "tranvia", 60, 180, ["t"]],
  ["tec_lrv", "TEC LRV 6100", "BE Tram TEC LRV 6100", "tranvia", 70, 200, ["t", "tt"]],
  ["avg_et2010", "AVG ET 2010", "DE Tram | AVG ET 2010", "tram_train", 100, 220, ["tt", "t", "re"]],
  ["tram_train_398", "Stadler Tram-Train 398", "BR Class 398", "tram_train", 100, 220, ["tt", "t"]],
  ["m5000", "Flexity M5000", "Manchester Metrolink Bombarder Flexity M5000", "tranvia", 80, 250, ["t", "tt"]],

  // —— Especiales ——
  ["glacier", "Glacier Express coaches", "CH Coach Glacier Express", "turistico", 90, 180, ["tur"]],
  ["scenic", "Composición panorámica", "CH Coach Glacier Express / scenic coaches", "turistico", 100, 180, ["tur"]],
  ["car_shuttle_ch", "AutoShuttle CH", "CH Coach Car Shuttle", "turistico", 100, 100, ["tur"]],
  ["night_viaggio", "Nocturno Viaggio", "AT Coach Viaggio Comfort / Night consists", "nocturno", 200, 250, ["n"]],
  ["aventra_710", "Aventra Class 710", "Bombardier Aventra Class 710", "cercanias", 140, 300, ["s", "or", "mc"]],
];

const lengthVariants = [
  { suffix: "2c", label: "2 coches", factorCap: 0.45, factorV: 1 },
  { suffix: "3c", label: "3 coches", factorCap: 0.65, factorV: 1 },
  { suffix: "4c", label: "4 coches", factorCap: 0.85, factorV: 1 },
  { suffix: "5c", label: "5 coches", factorCap: 1.0, factorV: 1 },
  { suffix: "6c", label: "6 coches", factorCap: 1.2, factorV: 1 },
];

const liveryVariants = [
  { suffix: "liv_rojo", label: "livrea rojo", cats: ["regional", "cercanias", "doble_piso"] },
  { suffix: "liv_azul", label: "livrea azul", cats: ["regional", "cercanias", "alta_velocidad", "intercity"] },
  { suffix: "liv_verde", label: "livrea verde", cats: ["regional", "regional_ligero", "regional_diesel", "turistico"] },
  { suffix: "liv_noche", label: "livrea nocturna", cats: ["nocturno", "larga_distancia", "alta_velocidad"] },
  { suffix: "liv_metro", label: "livrea metropolitana", cats: ["cercanias", "metro", "tranvia"] },
];

function toUnit([id, nombre, workshop_ref, categoria, vmax_kmh, capacidad, servicios], extra = {}) {
  return {
    id,
    nombre,
    workshop_ref,
    categoria,
    vmax_kmh,
    capacidad,
    servicios: [...servicios],
    ...extra,
  };
}

export function buildFleetUnits() {
  const units = baseUnits.map((u) => toUnit(u, { variante: "base", padre_id: null }));
  const byId = new Map(units.map((u) => [u.id, u]));

  // Variantes de longitud para EMU/regionales/cercanías (no locos ni coches sueltos)
  const stretchCats = new Set([
    "regional",
    "regional_ligero",
    "regional_diesel",
    "regional_hibrido",
    "cercanias",
    "doble_piso",
    "intercity",
    "tram_train",
  ]);

  for (const base of [...units]) {
    if (!stretchCats.has(base.categoria)) continue;
    // 2 variantes de longitud por base
    for (const lv of [lengthVariants[1], lengthVariants[3], lengthVariants[4]]) {
      const id = `${base.id}_${lv.suffix}`;
      if (byId.has(id)) continue;
      const u = {
        ...base,
        id,
        nombre: `${base.nombre} (${lv.label})`,
        capacidad: Math.round(base.capacidad * lv.factorCap),
        variante: lv.suffix,
        padre_id: base.id,
      };
      units.push(u);
      byId.set(id, u);
    }
  }

  // Variantes de livrea para ampliar catálogo usable por operadores
  for (const base of [...units.filter((u) => u.variante === "base")]) {
    for (const liv of liveryVariants) {
      if (!liv.cats.includes(base.categoria)) continue;
      const id = `${base.id}_${liv.suffix}`;
      if (byId.has(id)) continue;
      const u = {
        ...base,
        id,
        nombre: `${base.nombre} (${liv.label})`,
        workshop_ref: `${base.workshop_ref} / ${liv.label}`,
        variante: liv.suffix,
        padre_id: base.id,
      };
      units.push(u);
      byId.set(id, u);
    }
  }

  // Packs aeropuerto / premium derivados
  const aeroBases = units.filter(
    (u) => u.variante === "base" && (u.servicios.includes("ae") || u.servicios.includes("s") || u.servicios.includes("px"))
  );
  let aeroCount = 0;
  for (const base of aeroBases) {
    if (aeroCount >= 40) break;
    if (base.categoria === "tranvia" || base.categoria === "metro") continue;
    const id = `${base.id}_aero`;
    if (byId.has(id)) continue;
    const u = {
      ...base,
      id,
      nombre: `${base.nombre} (Aeropuerto)`,
      servicios: [...new Set([...base.servicios, "ae", "px"])],
      capacidad: Math.round(base.capacidad * 0.9),
      variante: "aero",
      padre_id: base.id,
    };
    units.push(u);
    byId.set(id, u);
    aeroCount++;
  }

  return units;
}

export function buildFleetDocument() {
  const unidades = buildFleetUnits();
  return {
    version: "0.2.0",
    nota: "Catálogo ampliado (cientos de unidades) inspirado en el Steam Workshop de Nimby Rails. Incluye modelos base, variantes de composición y livreas. workshop_ref son nombres de búsqueda orientativos.",
    colecciones_recomendadas: [
      {
        nombre: "European Trains",
        url: "https://steamcommunity.com/sharedfiles/filedetails/?id=2942644931",
        uso: "ICE, TGV, FLIRT, KISS, Desiro, Talent, S-Bahn alemanes, regionales y urbanos europeos",
      },
      {
        nombre: "Nimby Rails Workshop (búsqueda general)",
        url: "https://steamcommunity.com/workshop/browse/?appid=1134710",
        uso: "FLIRT 4, KISS configurable, Civity, Coradia, Flexity, Citadis, metros y packs mixtos",
      },
      {
        nombre: "Eurotrain / liveries",
        url: "https://steamcommunity.com/sharedfiles/filedetails/?id=3043840442",
        uso: "Composiciones y livreas europeas adicionales",
      },
    ],
    total: unidades.length,
    unidades,
  };
}
