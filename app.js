const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Массив из 165 аккаунтов
const sharedAccounts = [
  { game: "BeamNG.Drive", login: "beamngdrive123steam1", password: "Kte!22ijaAII12" },
  { game: "Kingdom Come Deliverance 2", login: "mosgq70379", password: "oeldf55726" },
  { game: "UNCHARTED™: Legacy of Thieves Collection", login: "uncharted_st", password: "UNCHARTED@8804" },
  { game: "Forza Horizon 4, ARK Survival, LEGO Batman", login: "nmsukt191", password: "batzaza191" },
  { game: "Black Myth Wukong", login: "gfk66337", password: "Acp234213" },
  { game: "Grand Theft Auto 5, Resident Evil 2, Resident Evil 3, Ведьмак 3", login: "0855j9", password: "zZ10301030" },
  { game: "Marvel's Spider Man 2", login: "groggymovement4", password: "DCN_LliOQhv" },
  { game: "Red Dead Redemption 2", login: "ynysa422", password: "@Gamerspace123" },
  { game: "NBA 2K20, Grand Theft Auto San Andreas, Grand Theft Auto 5", login: "rnmiike", password: "THEGODMIKE1" },
  { game: "Marvel's Spider Man Remastered", login: "mklvn2y9", password: "zhizhure1221" },
  { game: "The Last Of Us 2 Remastered, The Last Of Us Remastered, Geometry Dash, Resident Evil 2, 3, 4", login: "STEAMGAMESTT1", password: "funpay.com/users/6932278/" },
  { game: "Hogwarts Legacy", login: "nicasacracacenri", password: "EBA9Y59KGCTB" },
  { game: "Resident Evil 7 Biohazard", login: "jocuriargenrinia", password: "70Games.net92" },
  { game: "Grand Theft Auto 4", login: "wqm322495", password: "ac7QPfa3" },
  { game: "Horizon Forbidden West Complete Edition", login: "vonterr", password: "889162" },
  { game: "Cyberpunk 2077", login: "orderlyinoculat", password: "axQUk8etMajK" },
  { game: "Dying Light 2 Stay Human, Dying Light, Sons Of The Forest, The Forest, Forza Horizon 4", login: "earthlnwza5566", password: "2G6TEM5ZAZC6" },
  { game: "Euro Truck Simulator 2", login: "nfpprsq3h", password: "f1qslg5kp" },
  { game: "Atomic Heart", login: "wf6ju3bf5wc3", password: "qKnh6N9SLiMxyvXVX36d" },
  { game: "Forza Horizon 5", login: "bej01201", password: "Bejdw11201" },
  { game: "Call Of Duty Modern Warfare 2, Efootball Pes 2021", login: "dimkoxd", password: "2G6TEM5ZAZC6" },
  { game: "Mortal Kombat 11, Euro Truck Simulator 2", login: "steam123z17", password: "ZXCVBNMQQ" },
  { game: "Mortal Kombat 1", login: "Mortalk1pehkflt01", password: "TGVBFRETt01" },
  { game: "Farming Simulator 25", login: "neylavewe1985", password: "wFbmEcKQ" },
  { game: "Metro (все части), Sons Of The Forest, Dying Light, Ведьмак 3, Mafia 2", login: "negri_pidor1488", password: "fjbjnoDEFSjkndfgzhjkoCDSA09" },
  { game: "FIFA 22", login: "xxyenlover", password: "34cv56BN" },
  { game: "Terraria, Baldi's Basics Classic Remastered", login: "quincypugy", password: "0Heh%v4SSG" },
  { game: "Hearts Of Iron 4, Batman Arkham Asylum", login: "meteprotr", password: "3D88ASX2AMCG" },
  { game: "Ведьмак 3: Дикая Охота, ARK Survival", login: "thnavud1", password: "0641769856Za" },
  { game: "Call Of Duty Modern Warfare 2019, Marvel's Spider Man Remastered, Far Cry 3, Max Payne 3, Assassin's Creed 3", login: "soham123419", password: "Funpay-0nibist" },
  { game: "The Forest, Outlast 2", login: "hhied98481", password: "Deaiwoq217" },
  { game: "Detroit: Become Human", login: "Detroit_st", password: "DETROIT@7401" },
  { game: "Resident Evil 4 Remake", login: "bejdw24074", password: "steamkk.com" },
  { game: "Dying Light, Euro Truck Simulator 2, Left 4 Dead 2", login: "YaKrycheVasFP", password: "VM@KLGT8W34C" },
  { game: "Forza Horizon 5 + все DLC", login: "pq3sz8ar9rx8", password: "SZ7ZF8YSFCXE" },
  { game: "Call Of Duty Black Ops 3", login: "xbeverysketch", password: "st3@mxx645" },
  { game: "FIFA 21, FIFA 22", login: "rd5977", password: "951753852.ACHU" },
  { game: "Days Gone, Ea Sports FC 24, Grand Theft Auto 5", login: "juscelinolira", password: "CDTBTD66XEX6" },
  { game: "Sons Of The Forest, The Forest, Shedule, R.E.P.O, Hitman Absolution", login: "SDACHAvARENDY01", password: "$j2si2jLDSJFJ2Nsj" },
  { game: "Elden Ring, Ведьмак 3", login: "shushi_elden_ring", password: "Owner_shushiGames_Seller" },
  { game: "Red Dead Redemption 2, Ведьмак 3", login: "red_dead_profix", password: "DASjsaj72ow8" },
  { game: "Call Of Duty Modern Warfare 3, GTA 4, Call Of Duty Modern Warfare 2, Call Of Duty Black Ops", login: "sunzshiine", password: "msmb1122" },
  { game: "Call Of Duty WW2", login: "pandagame4418", password: "cod1452141" },
  { game: "Silent Hill 2", login: "aboodack", password: "DC5Z25E465DX" },
  { game: "Battlefield 5, ARK Survival", login: "zhangben6662", password: "BNKGTsnMWu" },
  { game: "Metro Last Light Redux, Metro Exodus, Cyberpunk 2077, The Forest, Miside", login: "cyberhitler1488", password: "Bbuv837FSgnB2" },
  { game: "Ghost Of Tsushima", login: "gihmt99337", password: "my_funpay_dtgame" },
  { game: "Black Myth Wukong", login: "mario_wukong", password: "QCP7PFHMW4VV" },
  { game: "Assetto Corsa, Euro Truck Simulator 2, City Car Driving, My Summer Car", login: "ShezyyyFunPay", password: "funpay.com/users/8943271/" },
  { game: "Metro Exodus и другие игры", login: "opgarpstore1", password: "safEA24O-" },
  { game: "Marvel's Spider Man Miles Morales, Hello Neighbor", login: "polszymek123", password: "Funpay-Onibist1" },
  { game: "Mafia 2 Definitive Edition, The Elder Scrolls 5 Skyrim", login: "hazer3", password: "S2477TT27EC6" },
  { game: "NBA 2K22", login: "Shixize1", password: "PwxcoNGgFM" },
  { game: "Mafia Definitive Edition, Mafia 3, Mafia 2 Definitive Edition", login: "sss0614", password: "Mafia$75" },
  { game: "BeamNG.drive", login: "mbig4912", password: "Eb2PLbZ3" },
  { game: "Sekiro Shadows Die Twice", login: "05796591", password: "Derkyt111666" },
  { game: "Hogwarts Legacy, Ghost Of Tsushima", login: "nrbon69177", password: "meisonlyme1A" },
  { game: "DayZ", login: "amlv63032", password: "CExXMoJXF1TU" },
  { game: "God Of War, Tomb Raider", login: "mayli1001", password: "MqPN05kcpk89" },
  { game: "Kingdom Come Deliverance 2", login: "phvmg47604", password: "bfmjj99570" },
  { game: "Doom The Dark Ages", login: "fdsfdsfds9824", password: "x2jrrd7mef3jqSX" },
  { game: "God Of War Ragnarok", login: "dart1997", password: "YXJYS80P7164" },
  { game: "Clair Obscur Expedition 33", login: "dgb236444", password: "tjjn248562" },
  { game: "The Last Of Us Remastered", login: "hiyondw615", password: "sp9wyq8s" },
  { game: "Lego Harry Potter, Elden Ring, Cuphead, Hitman 2, Terraria, Geometry Dash", login: "Thragg_767", password: "ev8Z5YyvY42RmiX" },
  { game: "CyberPunk 2077", login: "mardiprawdziwy", password: "G4market999" },
  { game: "Marvel's Spider Man Remastered, Marvel's Spider Man Miles Morales", login: "NEW2SPIDERSMANOFF581", password: "jMc3rP#=lBu\\{43fz{-v" },
  { game: "Grand Theft Auto 5, Rust, Among Us", login: "RsgKingz", password: "Deshawn2010$" },
  { game: "Gta Vice City, Hitman 2, Hitman Absolution, Fallout 3", login: "ihhza24z", password: "4ytb9naa" },
  { game: "Black Myth Wukong", login: "8782146147", password: "Derkytt090934" },
  { game: "Forza Horizon 5", login: "wbtq1089352", password: "steamok778899" },
  { game: "Stalker Shadow Of Chornobyl", login: "74gub9322di6", password: "tjjn248562" },
  { game: "Silent Hill 2 Remake", login: "xd7e5b", password: "djCZiNsY" },
  { game: "Cyberpunk 2077, Metro Exodus, Mafia", login: "necros13579", password: "13579zef" },
  { game: "Forza Horizon 4", login: "pf7yq3uu8ry9", password: "Tu2Ww3Uk1Ok6" },
  { game: "60 Seconds Reatomized", login: "ghuzn91928", password: "PexhPCWAW4" },
  { game: "Grand Theft Auto 5, Forza Horizon 5, Assetto Corsa", login: "uihgee2505", password: "g1r506wh1a56wehr106" },
  { game: "Cuphead", login: "su0wn1hf", password: "UOipTT58vG5XZ1" },
  { game: "Elden Ring Nightreign", login: "gaonengDW77703", password: "05698748" },
  { game: "The Last Of Us 2 Remastered", login: "k8ef0k53f", password: "RaysShopAkk!2" },
  { game: "Hello Neighbor", login: "markoparada2011", password: "5https://t.me/steamiq" },
  { game: "NBA 2K25", login: "kk80401", password: "kk223344kkwdw" },
  { game: "Far Cry 5, FIFA 22, Far Cry 3", login: "paraguaapeek", password: "2deenerodel2003" },
  { game: "Don't Starve Together, Black Myth Wukong, Forza Horizon 4", login: "34095617", password: "YDMBXMK7EK3K" },
  { game: "Crysis 3 Remastered", login: "fpfuryfamily", password: "thxfp362" },
  { game: "God Of War Ragnarok", login: "cretosesat1971", password: "JYQaFwd7zh" },
  { game: "Ghost Of Tsushima, Dying Light The Beast и другие", login: "moguchichlen228", password: "JBVAo_432fe1f" },
  { game: "Forza Horizon 4, Cyberpunk 2077 и другие", login: "fk1xo6tz8bt7", password: "cTiAP4Jh3xfW" },
  { game: "Dead Island 2, Dying Light", login: "fpsquimeeminon1", password: "funpaysquimeeminon2" },
  { game: "Sons Of The Forest, The Forest", login: "sonss22", password: "playerok.com/profile/QAVIX" },
  { game: "Grand Theft Auto 5", login: "tangjie1978643857", password: "kyiCogfrXj" },
  { game: "Doom Eternal, Hogwarts Legacy", login: "tgmmh97386", password: "toouf67180" },
  { game: "BeamNG.drive", login: "policeman123412", password: "BXy2Y25F" },
  { game: "Black Myth Wukong", login: "ven4ik_loveuu5", password: "KoloaKoachl1f4" },
  { game: "GTA V", login: "bm4488", password: "https://playerok.com/profile/MirArenDaff/products" },
  { game: "Dying Light 2 Stay Human", login: "kristinakrymova1987", password: "sVP3LgTXGJ" },
  { game: "Red Dead Redemption 2", login: "enyugame2906", password: "enyugame0002" },
  { game: "FIFA 22, FIFA 21", login: "hammouda401", password: "Spadassin014789" },
  { game: "Трилогия серии Mafia", login: "mafiapkg_pass", password: "MAFIAPKG@9278" },
  { game: "Transport Fever 2", login: "kuxt55781", password: "steamok333" },
  { game: "Atomic Heart", login: "wvpmf30392", password: "4213qmUuZjf2" },
  { game: "Mortal Kombat 11", login: "wsgln795693", password: "7LERANDR@BAW!@" },
  { game: "Clair Obscur Expedition 33", login: "seventy_echowfio", password: "70xplay.com" },
  { game: "Peak", login: "rkchj843930", password: "DaCpS071124" },
  { game: "Resident Evil 4", login: "iinnjj4759", password: "3dE6wjsplay" },
  { game: "Ready Or Not", login: "mj09uq5kw", password: "KKg0xvKyzVNs6y" },
  { game: "Mortal Kombat X, Hitman 2", login: "trnb2u4px", password: "qTkFA5498PUgrWZYHK KKg0xvKyzVNs6y" },
  { game: "No, I'm Not a Human", login: "hxsyp47527", password: "prlqw30923" },
  { game: "Resident evil 2", login: "bpzksitv1580", password: "5511765MMhh" },
  { game: "Resident evil 3", login: "popoaleksey1", password: "iVlGER8l" },
  { game: "Mortal combat x +19 игр", login: "mahdeeis", password: "mahdi07819966920" },
  { game: "Gta5, Euro Truck simulator 2", login: "johnlopez217", password: "funpayChainz96" },
  { game: "The Witcher 3, Age of History II, Assetto Corsa, BIGFOOT, Buckshot Roulette, Bulb Boy, Car Mechanic Simulator 2021, Contraband Police, Dead By Daylight, Detroit: Become Human, Don't Starve Together, Drive Beyond Horizon, The Elder Scrolls V: Skyrim, The Escapist 2, Factorio, Euro Truck Simulator 2, FAR: Lone Sails, Farming Simulator 22 / 25, The Forest, For za Horizon 4 / 5, Friday the 13th: The Game, Garry's Mod, Geometry Dash, Hearts of Iron IV, Hello Neighbor 1 / 2, Hitman: Absolution / Blood Money / Sniper Challenge, Kerbal Space Program, Left 4 Dead 2, Liar 's Bar, The Long Drive, Mafia, Metro 2033 / Exodus / Last Light, My Summer Car, NARUTO SHIPPUDEN: Ultimate Ninja Storm 4, Ride 4, Schedule I, Scrap Mechanic, Secret Neighbor, Sid Meier's Civilization VI", login: "abc00368", password: "358462377Tjc" },
  { game: "The Witcher 3, Alien Isolation, Batman: Arkham Knight / Arkham Asylum / Arkham City / Arkham Origins, Bendy and the Dark Revival, Bendy and the Inc Machine, Bendy: Lone Wolf, Besiege, Beyond: Two Souls, Bioshock: 1 / 2 / Infinite (remastered), Borderlands 2, Car Detailing Simulator, The Casting of Frank Stone, Choo-Choo Charles, Creepy Tale 1 / 2 / 3 , Devil May Cry 5, Dying Light, Euro Truck Simualtor 2, The Evil Within 1 / 2, Fallout 4, Firewatch, Getting Over It, Hatred, Heavy Rain, The henry Stickmin Collection, Hitman Absolution / Blood Money, Hooked on You: A Dead By Daylight, Injustice 2, Left 4 Dead 1 / 2, The Long Dark, Mad Max, Mafia 1 / 2 / 3, Metro 2033 / Last Light / Exodus, MiSide, Mortal Kombat 11 / X, Outlast, The Quarry, Raft, Ranch Simulator, Resident Evil 2 / 3 / 4 / 5 / 6 / VII Biohazard / Revelarion / Revelation 2 / VIII Village , Ride of the, Tomb Rider, Robocop: Rogue City, Rusty Lake Paradise, SILENT HILL f, SOMA, Tini Bunny, Tomb Rider, Hogwarts Legacy", login: "uwvehewx", password: "acqczzkv6Zrt" },
  { game: "The Witcher 3, ARK: Survival Evolved, The Binding of Isaac, The Binding of Isaac: Rebirth, Borderlands 2, Cult the Lamb, Cuphead, Cyberpunk 2077, Darkest Dungeon, Dead Cells, Don't Starve Together, Fallout 4, The Forest, Ghostrunner, Hades, Half-Life 2, Hollow Knight, Hollow Knight: Silksong, Hotline Miami 2, Journey To The Savage Planet, Kena: Bridge of Spirits, LEGO Star Wars: The Skywalker Saga, Magica, Monster Hunter World, Mortal Kombat 11, Plants vs. Zombie, Portal 1 / 2, Shovel Knight: Treasure Trove, Spiritfarer, Stardew Valley, Subnautica, Super Meat Boy, Terraria, Undertale, Vampire Survivors, Worms W.M.D, Hogwarts Legacy", login: "accinator4000", password: "hol_kni_sil" },
  { game: "Sons Of The Forest", login: "fendtking", password: "johndeere6215r" },
  { game: "Just Cause 4", login: "gcbio11345", password: "5fgPp49YSq0R" },
  { game: "Ready Or Not", login: "08520014", password: "yanzheng1125" },
  { game: "Fifa22", login: "rd5977", password: "951753852.ACHU" },
  { game: "Ферминг Симюлатор 25 (FS25)", login: "Qo6Su4Ij6Qg4", password: "?lgjDd!$yS10H%" },
  { game: "Rust", login: "jalmond111", password: "112233332211Ja" },
  { game: "Pc building simulator, the forest и тд", login: "kewbt36891", password: "FunPaySAPOZNIK" },
  { game: "UNCHARTED™: Legacy of Thieves Collection", login: "fara070707", password: "2MGKD64TADZ6" },
  { game: "Gta5, Euro Truck simulator 2", login: "dionildo3", password: "Dhodho23" },
  { game: "Horizon Zero Dawn", login: "suklpj4gy", password: "Hh603951ac" },
  { game: "Mafia The Old Country", login: "mafia_phasmavpn", password: "qWERTY33!" },
  { game: "BeamNG.drive", login: "xxl_deknky", password: "FF4CBEGXTX9K" },
  { game: "Stalker 2 Сердце Чернобыля", login: "zalobechi1983", password: "NJLZ4LWNTY1989" },
  { game: "Spider-Man: Miles Morales и другие", login: "hdpxu36706", password: "mnvqu33267" },
  { game: "It takes two", login: "davemullins90", password: "9wnrv35n3h" },
  { game: "Teardown, Gta 5", login: "chief_aaj", password: "z0y6mJImiW9kU" },
  { game: "Call Of Duty : Black Ops 3", login: "dvtlv0nmkl", password: "YSDI0C0kgE" },
  { game: "Ultrakill, Half life", login: "red1284829", password: "V1_mgHNyRh$8" },
  { game: "R.E.P.O", login: "tyypv07695", password: "WvbFGG456DV" },
  { game: "Mudrunner & Euro Truck Simulator 2", login: "dionildo3", password: "Dhodho23" },
  { game: "Silent Hill 2", login: "HDVLI42373", password: "jijing11010" },
  { game: "Kenshi, Toy Tinker Simulator, Payday 2, Green Hell, Warhammer: Vermintide - Return to the Reik, DNK T3V, Ranch Sim, Hobo: Tough Life, Rat Quest, The Enigma Box, Wild Baldi's Basics Classic Remastered, Spacewar, Metro Exodus, Spore, Getting Over It with Bennett Foddy, Metro Last Light Redux, Banana Hell, Left 4 Dead 2, Battle Simulator: Counter Skyhill, Doki Doki Literature Club, Sniper Elite 4, Sniper Elite 5, Stardew Valley, Caveman World: Mountains of Unga Boonga, Borderlands 2, Billie's Wheelie, Bongo Cat, 911 Operator, 100% Orange Juice, 12 is Better Than 6, The Long Drive, Metro 2033 Redux, Euro Truck Simulator 2, Dying Light, The Witcher 3: Wild Hunt, The Forest, Grim Dawn, The Deed, Dynasty, Far Cry 3, Far Cry 4, Far Cry 5, BeamNG.drive, Buckshot Roulette и тд.", login: "fnapes12", password: "Standoff113" },
  { game: "City Car Driving", login: "wsqfu308", password: "steamok003004" },
  { game: "GTA V Enhanced, GTA V Legacy, Mafia Definitive Edition, Mafia II Definitive Edition, Mafia III Definitive Edition, Farming Simulator 19, Assassin's Creed Syndicate, Garry's Mod, Arma 3, Among Us, Firefighting Simulator: The Squad, American Truck Simulator, Wreckfest, Verdun", login: "mexicano8199", password: "Renegade8199" },
  { game: "Horizon", login: "suklpj4gy", password: "Hh603951ac" },
  { game: "Quarantine zone", login: "gsmqj33321", password: "conew50689" },
  { game: "На фото", login: "GenaLovitop", password: "H4AkpmakTpiE" },
  { game: "Sea of Thieves", login: "mtaw23551", password: "mtaw123456" },
  { game: "Call of Duty: Modern Warfare", login: "crcrm50983", password: "Btzeeman21" },
  { game: "Hitman World Of Assassination", login: "wcicatricew", password: "marpanov_free9" },
  { game: "На фото", login: "xa3ut6az1dh8", password: "Yk2Rx0Wg7Lr2" },
  { game: "Общий доступ к Xbox Ultimate", login: "ComtoisCossey523@outlook.com", password: "efgoiuq3hbriu_Q12" },
  { game: "Mortal Kombat 11, Mortal Kombat X, Forza Horizon 5", login: "qqq2549", password: "playerok.com/profile/QAVIX" },
  { game: "BEAMNG", login: "uoorf89087", password: "fxzer58595" },
  { game: "Hello neighbor, Detroit, Hitman, Geometry dash, Left 4 dead", login: "Arsenicgya2112", password: "funpuy214521_" },
  { game: "Call Of Duty WW2 (и другие части серии)", login: "arks62", password: "playerokTovarStoreRe" },
  { game: "The Crew Motorfest (Ubisoft Connect)", login: "mqlfylzyhb@rambler.ru", password: "Mx2023!!9" },
  { game: "Postal 4 No Regerts", login: "lycnk701", password: "steamok0606" },
  { game: "Microsoft Fly Simulator и XPlane 12-11", login: "21flying", password: "Z2AKDCM3M6GZ" },
  { game: "Dying Light 2 Stay Human (+хорошая библиотека)", login: "thedrbld", password: "acc561209" },
  { game: "Metro Exodus + Enhanced Edition", login: "ivpopov13", password: "BQDhvkGfAPYh4Voqd8aco" },
  { game: "BeamNG.drive", login: "beamngfpaccusedd", password: "Funpayaccusedd." },
  { game: "Batman Arkham Knight и Raft (+большая библиотека)", login: "furkaneepro", password: "Ascarletawd3434" },
  { game: "Mafia Trilogy (Все три части мафии)", login: "enova36601", password: "aynhs76029" },
  { game: "WWE 2K20", login: "xrikm135", password: "steamok003004" },
  { game: "Sleeping Dogs Definitive Edition", login: "H7_is410365", password: "22https://t.me/steamiq" },
  { game: "God Of War Ragnorok", login: "gowranarokbggz7", password: "Bggz7770302#" },
  { game: "Metro 2033 Redux", login: "muxj5accmp", password: "Georgian326fg" },
  { game: "Atomic Heart", login: "wvpmf30392", password: "4213qmUuZjf2" },
  { game: "Call Of Duty Modern Warfare 2 (2009)", login: "bababagob555", password: "027535503" },
  { game: "Hitman Absolution", login: "gggggggfsafdsa", password: "marpanov_free7" },
  { game: "People Playground", login: "steamok1090206", password: "steamok888777" },
  { game: "Metro 2033", login: "magepll", password: "marpanov_free16" },
  { game: "BeamNG.drive", login: "Ht7Zq6Ed8Ga1", password: "Tl0Jy8Gl9Fq5" },
  { game: "F1 2024", login: "igoa10919", password: "30https://t.me/steamiq" },
  { game: "Clair Obscur Expedition 33", login: "seventy_qroqobgf", password: "70xplay.com" },
  { game: "Call Of Duty WW2 (+хорошая библиотека)", login: "arks62", password: "playerokTovarStoreRe" },
  { game: "Marvels Spider Man Miles Morales, Spider Man Remastered, Mortal Kombat 11 And more AAA games", login: "oqmxt37506", password: "ushgs799funpay883" },
  { game: "Crimson Desert Deluxe Edition", login: "ehtkd33230", password: "vohhe98963" },
  { game: "Schedule 1", login: "fifj10864", password: "Rogerard7676" },
  { game: "BeamNG Drive", login: "ynhtvAede2vynh", password: "siski339cwU0Q5H3wWWRvb" },
  { game: "Cyberpunk 2077 (+хорошая библиотека)", login: "vzooy75082", password: "auodt55959" },
  { game: "Dying Light The Beast", login: "ecvgz63808", password: "xeujn89038" },
  { game: "Uncharted 4: Legacy of Thieves Collection", login: "pokopowadventure", password: "www.pokopow.com#8392" },
  { game: "Call Of Duty Modern Warfare 2 (2022)", login: "uj5j45311", password: "FElvc5204" },
  { game: "Pragmata", login: "Puzir8081", password: "Hx@836RvMa95E" },
  { game: "Black Myth Wukong", login: "tronghp1234", password: "Tronghp1232334@" },
  { game: "Days Gone (+хорошая библиотека)", login: "Qx9Tk9Nx0Ca1", password: "Pm0Ta0Zh8Wa5" },
  { game: "STALKER 2 Heart Of Chernobyl", login: "xvdgfghfh", password: "aojjr17797" },
  { game: "Crimson Desert", login: "oiato98547", password: "wvlyn58167" },
  { game: "Left 4 Dead 2", login: "skibiditopfunpayofflineaccaynt", password: "Safs@42352jkkdfsuefdsjeh@hu!ihsd" },
  { game: "Forza Horizon 5", login: "flusstim28893", password: "https://funpay.com/users/6442502/" },
  { game: "Pragmata", login: "cycxr66898", password: "Nekt0inoy" },
  { game: "Все части серии Metro", login: "frwzx76017", password: "https://funpay.com/users/16100391/" },
  { game: "ARC Raiders", login: "uzes79494", password: "Georgian326fg!" },
  { game: "Forza Horizon 5", login: "ux3zc4zm5ed5", password: "miraque0*" },
  { game: "Hello Neighbor (+хорошая библиотека)", login: "pucyhxul1809", password: "GGSEL_CopperS" },
  { game: "Horizon Forbidden West", login: "ForbiiiddenWest", password: "Forbidden2$4567" },
  { game: "Subnautica 2 (+хорошая библиотека)", login: "umuyd62770", password: "pmo090710" },
  { game: "Stardew Valley", login: "qq280890801", password: "Qq921225" },
  { game: "Brick Rigs", login: "brianrobinson8z", password: "vsnsuswmbo" },
  { game: "Universe SandBox", login: "ifiqg350", password: "steamok45245235" },
  { game: "World Box", login: "ruhpz331", password: "xicxe352" },
  { game: "Mortal Kombat 11", login: "rivalchik52", password: "VADIMCHIK228" },
  { game: "Forza Horizon 6", login: "ebyvh18205", password: "azxak61276" },
  { game: "Hello Neighbor 2", login: "mylann_flashh", password: "31https://t.me/steamiq" },
  { game: "Hearts Of Iron 4", login: "Gotfaunt", password: "L9TBc10eS1Im7di" },
  { game: "Saints Row The Third Remastered", login: "steamok1090064", password: "steamok200" },
  { game: "Subnautica 2", login: "yawmo27399", password: "krucv57682" },
  { game: "Forza Horizon 6", login: "aprjq68036", password: "Nekt0fpFH6" },
  { game: "Tom Clancy's Ghost Recon Breakpoint", login: "hcvrm82378", password: "%chri1218%" },
  { game: "Subnautica 2", login: "tjbqo31217", password: "uybwx2853832A" },
  { game: "Wallpaper Engine", login: "hqcw83331", password: "ivovasilis6456" },
  { game: "Forza Horizon 6", login: "nwcnnGP43", password: "funpay-fr1zzq" },
  { game: "First Light 007", login: "ujm701041", password: "TlI909452" },
  { game: "Очень много игр (не сосчитать)", login: "laszlovoros60", password: "pazalyhozo4688" },
  { game: "Resident Evil Requiem (+жирная библиотека)", login: "ricciganggame", password: "https://funpay.com/users/5644459/" },
  { game: "Ready Or Not", login: "ydic63676", password: "HouseReady1@" },
  { game: "The Last Of Us Part 2", login: "madishare11111", password: "79cBeTCpEZjABC_" },
  { game: "RX Riders Republic", login: "58786917", password: "25925863" },
  { game: "007 First Light", login: "Juj22485", password: "sf757376" },
  { game: "Uncharted The Legacy Of Thieves Collection", login: "fogmool", password: "Nutersonk43!" },
  { game: "Dark SOULS 3 + Игры", login: "asdzxc12112", password: "GaxkRrdsSB82" },
  { game: "Escape the Backrooms", login: "kmkaw84460", password: "33https://t.me/steamiq" },
  { game: "Call Of Duty Modern Warfare 2019", login: "financialscorpion39551", password: "n40saxt50yiyn4g!zru3b" },
  { game: "Stalker 2 Heart Of Chernobyl", login: "statalalal1971", password: "8ia1uejk" },
  { game: "God Of War Ragnorok", login: "ragnarok_byheero", password: "https://t.me/steamaccountsog" },
  { game: "Mon Bazou", login: "selfishsturgeon4899", password: "Sully!?09" },
  { game: "Farming Simulator 22", login: "aurelie_8283", password: "8DDE8XKS8GSK" },
  { game: "Meccha Chameleon", login: "klimflain234", password: "crTf(T%yY'sN-62" },
  { game: "Куча крутых игр, на любой вкус", login: "overfreak911", password: "yachertila" },
  { game: "Arma 3 + неплохая библиотека", login: "berk1158", password: "arifkaya2007" },
  { game: "Farming Simulator 25", login: "yromadev1", password: "xDvTSb37UyBRsY" },
  { game: "Red Dead Redemption 2", login: "presidentialbandicoot8056", password: "f-r-e-e-akk-tg:@hyznet" },
  { game: "Все возможные части Call Of Duty", login: "march_2103", password: "x_plays111" },
  { game: "Subnautica", login: "6raymone23", password: "BilyjDeqqC" },
  { game: "Call Of Duty Modern Warfare 3 (2023)", login: "mmzjlo8x", password: "glIIsTNozyiu" },
  { game: "Pes 2019 & Pes 2016", login: "pes2019pes", password: "Pe$$ep97!" },
  { game: "Crysis 3 Remastered + хорошая библиотека", login: "frwzx76017", password: "https://funpay.com/users/16100391/" },
  { game: "Elden Ring", login: "rpatt27237", password: "funpayfeatherqElden" },
  { game: "Arma Reforger", login: "hollygordon1961", password: "acbc42b6247a41c7bfa3e88bb3e81e9b" },
  { game: "Human Fall Flat", login: "1353358044", password: "wangshiyao123" },
  { game: "Dead By Daylight", login: "zaydd73995", password: "xvtzn66391" },
  { game: "Dying Light 2 Stay Human", login: "xdrmw05622", password: "cwbme10188" },
  { game: "BeamNG.drive и Teardown", login: "tgasb88565", password: "Ffe93Gefr" },
  { game: "Need For Speed Unbound", login: "kagqg46840", password: "igik8626" },
  { game: "Dark Souls Remastered", login: "bot22_2", password: "bot222RT" },
  { game: "Need For Speed Heat", login: "yghf42788", password: "Progamer@" },
  { game: "Mafia The Old Country", login: "mafia_phasmavpn", password: "qWERTY33!" },
  { game: "Mafia 2 & Mafia 2 Definitive Edition", login: "enova36601", password: "aynhs76029" },
  { game: "Euro Truck Simulator 2", login: "lc4tk0bn9fs5", password: "Polopolo9" },
  { game: "Project Zomboid", login: "wn61CUFy", password: "ng20QBGP" },
  { game: "The Elder Scrolls V Skyrim", login: "jadalilgarcia", password: "sk8erboi8" },
  { game: "Just Cause 3", login: "m0rfisftw", password: "6619264692Morfis" },
  { game: "The Last Of Us Remastered & The Last Of Us 2 Remastered", login: "thelast1q", password: "playerok.com/profile/QAVIX" },
  { game: "City Car Driving", login: "moteenhoiki", password: "Dj3JOO3fjRVtR67" },
  { game: "Split Fiction", login: "kauoy17421", password: "esqa74870W" },
  { game: "No Man's Sky", login: "wbtq1085903", password: "steamok35664Y" },
  { game: "Библиотека: Resident Evil 4 Remake, Resident Evil 7 Biohazard, Mortal Kombat 11, MiSide", login: "xdrmw05622", password: "cwbme10188" },
  { game: "Библиотека: Pragmata, Crimson Desert, Forza Horizon 6, Subnautica 2", login: "arenda9121", password: "Ytrnj274" },
  { game: "Библиотека: God Of War Ragnarök, Blood Strike, House Flipper, Space Aces", login: "pablo79911", password: "F552YFK7K5B9" },
  { game: "Библиотека: Farming Simulator 22", login: "aurelie_8283", password: "8DDE8XKS8GSK" },
  { game: "Библиотека: Call Of Duty World At War, Call Of Duty Black Ops, Call Of Duty Black Ops 2, Call Of Duty Modern Warfare 2, Call Of Duty Modern Warfare 3, Counter Strike Source, Serious Sam 3", login: "stillyn", password: "Asdzxc1234)))))" },
  { game: "Библиотека: Ready Or Not", login: "mj09uq5kw", password: "KKg0xvKyzVNs6y" },
  { game: "Библиотека: Call Of Duty Modern Warfare (2019), Combat Master Season 5, Skate.", login: "financialscorpion39551", password: "n40saxt50yiyn4g!zru3b" },
  { game: "Библиотека: Horizon Zero Down Complete Edition, Cyberpunk 2077, Drift Legends 2, Space War", login: "alridergans1985", password: "qJgS2p5PEL1992" },
  { game: "Библиотека: Hollow Knight Silksong, Hollow Knight, Crimson Desert, Dying Light, Mafia 2, The Last Of Us Part 1, Resident Evil Requiem", login: "ricciganggame", password: "https://funpay.com/users/5644459/" },
  { game: "Библиотека: FIFA 22, ARK Survival Evolved", login: "marianalvarezzz1992", password: "Yanier1992" },
  { game: "Библиотека: Hogwarts Legacy, WRC 7, WRC 5", login: "zon_jb", password: "Tomteland98" },
  { game: "Библиотека: Mortal Kombat X, Mortal Kombat 11, Detroit Become Human, Crysis 3 Remastered, Crysis 2 Remastered, Outlast, The Forest, Sons Of The Forest, Dishonored, The Long Dark, City Car Driving", login: "neffffffffex", password: "https://funpay.com/users/17414395/" },
  { game: "Библиотека: Resident Evil 2 Remake", login: "shenghuaweiji2a", password: "Hh6039512a" },
  { game: "Библиотека: God Of War 2018 + фурри игры", login: "oiydz866", password: "chengyu456778" },
  { game: "Библиотека: Call Of Duty Vanguard, Hello Neighbor", login: "tozinabro1977", password: "2CH4bGOe6S1978" },
  { game: "Библиотека: EA Sports FIFA 23, Euro Truck Simulator 2, Pes 2016", login: "coranhart", password: "H9mqE6og31" },
  { game: "Библиотека: Grid 2, BeamNG.drive, Sleeping Dogs Definitive Edition, Dead By Daylight, Just Cause 2, Prince Of Persia Warrior Within, Prince Of Persia The Two Thrones, Prince Of Persia The Sands Of Time, Euro Truck Simulator 2, Marvel's Midnight Suns, TEKKEN 7, Among Us, NBA 2K20, Shadow of The Tomb Rider, Uncharted 4, Hitman 2, Garry's Mod, Hellblade: Senua's Sacrifice, Left 4 Dead 2, Call Of Duty WW2, Asetto Corsa 2, Mafia Definitive Edition, Mafia 2, Mafia 2 Definitive Edition, Mafia 3, Batman Arkham City, The Forest, The Elder Scrols 4: Oblivion, The Elder Scrols 5: Skyrim, Just Cause 3, Heart Of Iron 4, Lego Marvel Super Heroes, Mortal Kombat 11, Batman Arkham Knight, Batman Arkham Origins, Kingdome Come Deliverence", login: "ba1aq2qp1fq4", password: "Gf9Jr5Oh1Ek9" },
  { game: "Xbox Game Pass", login: "HogwartsLegacy14@yandex.ru", password: "H57&734%497$Forza5" },
  { game: "Библиотека: The Quarry, Hitman Blood Money, Resident Evil 7 Biohazard, Resident Evil 2 Remake, Resident Evil 4 Remake, Mafia Definitive Edition, Cyberpunk 2077, Resident Evil Requiem + еще много крутых игры", login: "dedqs21651", password: "FrZ78mgY" },
  { game: "Библиотека: GTA lV, GTA V, Days Gone, Farcry 5, Farcry Primal, Tom Raider Triology, Sleeping Dogs, Max Payne 3, Just Cause 2 / 3, Star Wars Jedi Fallen Order, For Honor и многое другое...", login: "dukanvaettname", password: "bananvagen1" },
  { game: "Библиотека: Ghost Of Tsushima", login: "fuogl63477", password: "siuk94330T" },
  { game: "Библиотека: Gang Beasts", login: "cwn_apollo2", password: "LiamWright05102005" },
  { game: "Библиотека: Garry's mod, Hollow knight, Geometry dash, Resident evil 7 teaser: beginning hour, Forza horizon 5, The forest, Hollow knight: silksong, Metro 2033 redux, BeamNG.drive, Arc raiders, Palword, Among us, Hitman world of assassination, Terraria, Spore, Far cry 3, Cities: skylines, Mafia III: definitive edition, Train sim world 6, Detroit: become human, Left 4 dead 2, Dead by daylight, Euro truck simulator 2, Doom eternal, Raft", login: "rvmxh26513", password: "cLKz95R5f1" },
  { game: "Библиотека: Phasmophobia, Mortal combat X, South Park the fractured but whole, CarX drifting online, Dark deception, Skater xl", login: "majinluffy1420", password: "Supreme1025" },
  { game: "Библиотека: Marvel's Spider Man 2", login: "sp2_by_heero", password: "https://t.me/steamaccountsog" },
  { game: "Библиотека: Doom Eternal, Borderlands 2, Russian Fishing 4, Postal, Warframe", login: "99892722", password: "04216324" },
  { game: "Библиотека: Marvel's Spider Man Miles Morales", login: "cnykqx48s", password: "Progamer@" },
  { game: "Библиотека: Prototype 2", login: "lu8xq0oo0id9", password: "XKDS65SGGKD2" },
  { game: "Библиотека: Mad Max, Mortal Kombat X", login: "david22102007", password: "D22102007" },
  { game: "Библиотека: Grand Theth Auto 5 Legacy, Grand Theth Auto 5 Enchanced, Naraka: Bladepoint", login: "wecd820201", password: "dddQIK2Yb" },
  { game: "Xbox Game Pass", login: "HogwartsLegacy18@yandex.ru", password: "H57&734%497$Forza6" },
  { game: "Библиотека: Wallpaper Engine, Dead By Daylight, Black Squad, Crab Game, Unturned", login: "supercraft_yt1", password: "11025029q" },
  { game: "Библиотека: Doom (2016)", login: "matysek_xd0", password: "tunta123" },
  { game: "Библиотека: Ведьмак 3: Дикая Охота, Cyberpunk 2077, Sekiro Shadows Die Twice, Muck, Rage 2, Pes 2016, Blood Strike, Destiny 2, Marvel Rivals", login: "by_heero", password: "https://t.me/steamaccountsog" },
  { game: "Библиотека: Meccha Chameleon, Grand Theft Auto 5 Enhanced, Among Us", login: "awaki_ln", password: "Lenny1209" },
  { game: "Библиотека: Black Myth Wukong, Resident Evil 4 Remake, Resident Evil Village, Mafia 2 Defitive Edition, Mafia Definitive Edition, Tomb Raider Underworld, Rise Of The Tomb Raider, Batman Arkham Knight, Ведьмак 3 Дикая Охота, Metro Exodus, Plants Vs Zombies, Control Ultimate Edition, Bioshok Remastered", login: "liujunjie123413", password: "liujunjie12A" },
  { game: "Библиотека: Resident Evil 9 Requiem", login: "SkizeGames52745RE95", password: "www.skizegames.store" },
  { game: "Библиотека: Farming Simulator 17, Spin Tires, Stable Guys", login: "stimgamerfarmingsymulator2017", password: "steamgamer321fs!2017" },
  { game: "Библиотека: Assassin's Creed Origins, Hitman 2, Terraria", login: "janschumandl", password: "135642qqabc" },
  { game: "Библиотека: Geometry Dash, Euro Truck Simulator 2, Among Us, Garry's Mod, Hearts Of Iron 4, Hello Neighbor, Undertale, Terraria, Dying Light", login: "yappydoor01337", password: "d{E}dsvvrb$~0tJ" },
  { game: "Библиотека: Call Of Duty Modern Warfare 3 (2011)", login: "avtoritet118", password: "KSGG8EE76DB9" },
  { game: "Библиотека: Naruto Shippuden Ultimate Ninja Storm 4, Baldi's Basics' Classic Remastered", login: "Fi7Ft7Sf5Dt4", password: "Wr2Lr8Xh1Qj4" },
  { game: "Библиотека: Lego Ninjago Movie Videogame", login: "aguilaryamir207", password: "Wargames12" },
  { game: "Библиотека: Detroit: Become Human, Red Dead Redemption 2, Ведьмак 3: Дикая Охота, Grand Theft Auto 5 Enhanced, Mafia Definitive Edition", login: "streetyain", password: "str2n11..1" },
  { game: "Библиотека: The Hunter Call Of The Wild", login: "relevantquokka64991", password: "h3it1vyzc8ipkc7!wgewz" },
  { game: "Библиотека: Tom Clancy's Ghost Recon Breakpoint, Eurotruck Simulator 2", login: "jbtxk48975", password: "saeed_7404" },
  { game: "Библиотека: Farming Simulator 19, Pacify", login: "zazaxe4", password: "37191610z" },
  { game: "Библиотека: Call Of Duty Modern Warfare 2 (2009)", login: "wickaed", password: "f-r-e-e-akk-tg:@hyznet" },
  { game: "Библиотека: Mafia 2 Classic, Mafia 2 Definitive Edition, Mafia Definitive Edition", login: "enova36601", password: "aynhs76029" },
  { game: "Библиотека: The Last Of Us 2 Remastered, The Last Of Us Remastered, My Sexy Neighbor", login: "thelast1q", password: "playerok.com/profile/QAVIX" },
  { game: "Библиотека: Mortal Kombat 11", login: "mortalkombat11sharing", password: "mortalkombat112019" },
  { game: "Библиотека: Snow Runner, Left 4 Dead 2, Rust", login: "lsoiy210", password: "lwl67033R" },
  { game: "Библиотека: Mud Runner, Cities Skylines, SnowRunner, Euro Truck Simulator 2, Left 4 Dead 2, The Forest, Stardew Valley, Borderlands 2, Terraria, Car Mechanic Simulator 2018, Battlefield 1, Green Hell", login: "tczfy83308", password: "HE1092618" },
  { game: "Библиотека: Arma 2, Left 4 Dead 2", login: "supersuper61", password: "coelho2015" },
  { game: "Библиотека: Call Of Duty Modern Warfare 2 (2022)", login: "uexq59805", password: "jjackson14" },
  { game: "Библиотека: 007 First Light, Forza Horizon 6, Lego Batman Legacy Of The Dark Knight", login: "bcaxo55681", password: "noyyb36531" },
  { game: "Библиотека: NBA 2K26, Skate.", login: "ofyxw04053", password: "uixay83374" },
  { game: "Библиотека: Meccha Chameleon", login: "ydtdo32097", password: "PzIf3P1GXw2dEJ" },
  { game: "Библиотека: Grand Theft Auto San Andreas, Grand Theft Auto 5 Enhanced, Euro Truck Simulator 2, Left 4 Dead 2, Bus Simulator 2012, Microsoft Flight Simulator X, Transport Fever 2", login: "joelal123", password: "Bigboss007@" },
  { game: "Библиотека: R.E.P.O", login: "anthonykelly1972", password: "TovarStore123" },
  { game: "Библиотека: The Forest, Among Us", login: "wbtq1083464", password: "steamok45785112" },
  { game: "Библиотека: Cyberpunk 2077, Mafia The Old Country, The Last Of Us Remastered, Forza Horizon 4, Shedule 1, Sons Of The Forest, Hearts Of Iron 4, Resident Evil 4 Remake, Resident Evil 2 Remake, Outlast, Days Gone, Mafia 3, Mafia 2, Mafia Definitive Edition, Metro 2033, Metro Exodus, God Of War (2018), Detroit Become Human, Stalker Shadow Of Chernobyl, Ведьмак 3 Дикая Охота, Dying Light, The Witcher Enhanced Edition, The Witcher 2 Enhanced Edition, Pay Day 2, Euro Truck Simulator 2", login: "toto121aktiva", password: "afkaweo9312jfia0" },
  { game: "Библиотека: Call Of Duty Modern Warfare (2019)", login: "financialscorpion39551", password: "n40saxt50yiyn4g!zru3b" },
  { game: "Библиотека: Mortal Kombat 1, Mortal Kombat 11, Mortal Kombat X", login: "SkizeGames13801MK1", password: "www.skizegames.store" },
  { game: "Библиотека: Bodycam, Dead By Daylight, Dead Island 2", login: "s6242xmx", password: "IZNnSgUjrbdK" },
  { game: "Библиотека: Horizon Zero Dawn Complete Edition", login: "jollyrojer919", password: "offlineactivator919" },
  { game: "Библиотека: Resident Evil Requiem", login: "dedqs21651", password: "FrZ78mgY" },
  { game: "Библиотека: Farming Simulator 19, Euro Truck Simulator 2", login: "zazaxe4", password: "37191610z" },
  { game: "Библиотека: Grand Theft Auto 5 Enhanced, Grand Theft Auto 5 Legacy", login: "kostagjorcepetrov", password: "marpanov_free15" },
  { game: "Библиотека: Trailmakers", login: "steamok1089916", password: "steamok765567" },
  { game: "Библиотека: Farming Simulator 17, Spin Tires, Stable Guys", login: "stimgamerfarmingsymulator2017", password: "steamgamer321fs!2017" },
  { game: "Библиотека: The Binding Of Isaac Rebirth", login: "wbtq1086053", password: "steamok987789" },
  { game: "Библиотека: Cyberpunk 2077", login: "ou72852", password: "Hh2468iut" },
  { game: "Библиотека: Sniper Elite 5, Sniper Elite 4", login: "ooSniperDeluxeoo", password: "DEL9OElite8Sniper9" },
  { game: "Библиотека: Five Night's at Freddy's Secret Of Mimic", login: "fredglover1960", password: "nqszzger9229$!1v0" },
  { game: "Библиотека: NBA 2K26", login: "Ds2Im2Nk3Gy2", password: "Ud9Mw0Mo7Iu7" },
  { game: "Библиотека: Rust", login: "zgejcplxny", password: "tvzE3igz2A" },
  { game: "Библиотека: EA Sports FIFA 22", login: "marianalvarezzz1992", password: "Yanier1992" },
  { game: "Библиотека: Forza Horizon 5", login: "funnymassivepony08", password: "Roundkick991XME342" },
  { game: "Библиотека: Five Nights At Freddy's", login: "zuopy28956", password: "elib56353E" },
  { game: "Библиотека: Grand Theft Auto 5 Legacy, Grand Theft Auto 5 Enhanced", login: "wecd820201", password: "dddQIK2Yb" },
  { game: "Библиотека: Death Stranding 2 On The Beach", login: "wgum29vkmrnjv", password: "raRN9AGCUPljKdlSL4" },
  { game: "Библиотека: Uncharted Legacy Of Thieves Collection", login: "ao0na8xp5yp2", password: "Mn6Ld9Ex1Fr8" },
  { game: "Библиотека: Stalker 2 Heart Of Chernobyl", login: "zalobechi1983", password: "NJLZ4LWNTY1989" },
  { game: "Библиотека: Stray", login: "pmrh73716", password: "chengyu2444477" },
  { game: "Библиотека: Far Cry 1-2, Far Cry 3, Far Cry 4, Far Cry 5, Far Cry 6", login: "farcryxiajsh", password: "playerok.com/profile/QAVIX" },
  { game: "Библиотека: Construction Simulator", login: "probunloti1982", password: "an41526kx" },
  { game: "Библиотека: BeamNG.drive", login: "Ht7Zq6Ed8Ga1", password: "Tl0Jy8Gl9Fq5" },
  { game: "Библиотека: Hello Neighbor 2, Hello Neighbor, Miside", login: "Direp12", password: "112314533Q" },
  { game: "Библиотека: Ghost Of Tsushima, Far Cry 6, Call Of Duty Modern Warfare 2 (2022)", login: "sfsefawd", password: "sef435$%#" },
  { game: "Библиотека: God Of War (2018)", login: "oiydz866", password: "chengyu456778" },
  { game: "Библиотека: Subnautica 2", login: "codl39195", password: "Pt5Ac2Fu8Yf66t" },
  { game: "Библиотека: Assetto Corsa", login: "babai0_02", password: "Kasra.0919" },
  { game: "Библиотека: Lego Marvel Super Heroes", login: "twistnewold", password: "5sMgwST4L5j" }
];

// Безопасная JSON-строка для вставки в <script> внутри HTML
const accountsJson = JSON.stringify(sharedAccounts)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Steam Checker</title>
    <style>
        :root {
            --bg: #050508; --surface: rgba(12, 12, 18, 0.6); --border: rgba(255, 255, 255, 0.06);
            --text: #e8e8f0; --text-muted: #6b6b7d; --accent: #00d4ff; --accent-glow: rgba(0, 212, 255, 0.4);
            --ok: #00ff9d; --err: #ff3366; --warn: #ffb800;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg); color: var(--text); display: flex; justify-content: center;
            align-items: flex-start; min-height: 100vh; padding: 32px 20px;
        }
        .container {
            background: var(--surface); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            padding: 2.5rem; border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
            width: 100%; max-width: 600px; position: relative;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .container::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
        }
        .head { display: flex; justify-content: center; align-items: center; margin-bottom: 2rem; }
        .logo {
            font-size: 1.2rem; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
            color: var(--text); display: flex; align-items: center; gap: 10px;
        }
        .logo::before {
            content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--accent);
            box-shadow: 0 0 12px var(--accent), 0 0 24px var(--accent-glow); animation: pulse 2.5s infinite;
        }
        .nav-tabs {
            display: flex; gap: 4px; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border);
            border-radius: 12px; padding: 4px; margin-bottom: 2rem;
        }
        .nav-tab {
            flex: 1; padding: 12px; text-align: center; font-size: 0.85rem; font-weight: 600;
            color: var(--text-muted); border-radius: 8px; cursor: pointer; transition: all 0.3s ease;
            user-select: none;
        }
        .nav-tab.active {
            background: rgba(0, 212, 255, 0.08); color: var(--accent);
            box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.2), 0 0 20px rgba(0, 212, 255, 0.08);
        }
        .view-section { display: none; }
        .view-section.active { display: block; animation: fadeIn 0.4s ease; }
        .field { margin-bottom: 1rem; position: relative; }
        .field label {
            display: block; font-size: 0.75rem; letter-spacing: 1.5px; text-transform: uppercase;
            color: var(--text-muted); margin-bottom: 6px; font-weight: 600;
        }
        .field input {
            width: 100%; padding: 14px 16px; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border);
            border-radius: 10px; color: var(--text); font-size: 0.95rem; outline: none; transition: all 0.3s ease;
        }
        .field input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        .btn {
            width: 100%; padding: 14px; margin-top: 0.5rem; background: transparent;
            border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 10px; color: var(--accent);
            font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.3s ease;
        }
        .btn:hover:not(:disabled) { background: rgba(0, 212, 255, 0.1); border-color: var(--accent); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; border-color: var(--border); color: var(--text-muted); }
        .result {
            margin-top: 1.5rem; padding: 14px; border-radius: 10px; font-size: 0.85rem; font-weight: 700;
            display: none; animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .result.ok { background: rgba(0, 255, 157, 0.05); border: 1px solid rgba(0, 255, 157, 0.2); color: var(--ok); }
        .result.err { background: rgba(255, 51, 102, 0.05); border: 1px solid rgba(255, 51, 102, 0.2); color: var(--err); }
        .result.warn { background: rgba(255, 184, 0, 0.05); border: 1px solid rgba(255, 184, 0, 0.2); color: var(--warn); }

        .search-box { margin-bottom: 1rem; }
        .search-box input {
            width: 100%; padding: 14px 16px; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border);
            border-radius: 10px; color: var(--text); font-size: 0.95rem; outline: none; transition: all 0.3s ease;
        }
        .search-box input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
        .accounts-grid {
            display: grid; grid-template-columns: 1fr; gap: 12px; max-height: 500px;
            overflow-y: auto; padding-right: 4px;
        }
        .accounts-grid::-webkit-scrollbar { width: 6px; }
        .accounts-grid::-webkit-scrollbar-thumb { background: rgba(0, 212, 255, 0.2); border-radius: 3px; }
        .account-card {
            background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border); border-radius: 12px;
            padding: 16px; transition: all 0.3s ease;
        }
        .account-card:hover { border-color: rgba(0, 212, 255, 0.3); background: rgba(0, 212, 255, 0.03); }
        .account-game {
            font-size: 0.95rem; font-weight: 700; color: var(--text); margin-bottom: 12px;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .account-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .account-row:last-child { margin-bottom: 0; }
        .account-label {
            font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;
            letter-spacing: 1px; width: 60px; flex-shrink: 0;
        }
        .account-value {
            flex: 1; font-size: 0.85rem; color: var(--text); font-family: 'Consolas', monospace;
            background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 6px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            min-width: 0;
        }
        .copy-btn {
            width: auto; padding: 8px 12px; margin: 0; background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 6px; color: var(--accent);
            font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
            flex-shrink: 0;
        }
        .copy-btn:hover { background: rgba(0, 212, 255, 0.2); }
        .copy-btn.copied { background: rgba(0, 255, 157, 0.2); border-color: var(--ok); color: var(--ok); }

        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(0, 212, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="head">
            <div class="logo">Steam Checker</div>
        </div>

        <div class="nav-tabs">
            <div class="nav-tab active" data-view="checker">Проверка</div>
            <div class="nav-tab" data-view="accounts">Общие аккаунты</div>
        </div>

        <div id="checkerView" class="view-section active">
            <div class="field">
                <label>Логин</label>
                <input type="text" id="username" placeholder="Введите логин" autocomplete="off">
            </div>
            <div class="field">
                <label>Пароль</label>
                <input type="password" id="password" placeholder="Введите пароль">
            </div>
            <button class="btn" id="checkBtn" onclick="checkAccount()">Проверить</button>
            <div class="result" id="result"></div>
        </div>

        <div id="accountsView" class="view-section">
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Поиск по названию игры..." oninput="filterAccounts()">
            </div>
            <div class="accounts-grid" id="accountsGrid"></div>
        </div>
    </div>

    <script>
        const sharedAccounts = \${accountsJson};

        function escapeHtml(str) {
            return String(str == null ? '' : str).replace(/[&<>"']/g, function(c) {
                return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
            });
        }

        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.view + 'View').classList.add('active');
                if (tab.dataset.view === 'accounts') renderAccounts(sharedAccounts);
            });
        });

        function renderAccounts(accounts) {
            const grid = document.getElementById('accountsGrid');
            if (!accounts || accounts.length === 0) {
                grid.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:20px;">Ничего не найдено</div>';
                return;
            }
            grid.innerHTML = accounts.map((acc, index) => \`
                <div class="account-card">
                    <div class="account-game">\${escapeHtml(acc.game)}</div>
                    <div class="account-row">
                        <span class="account-label">Логин</span>
                        <span class="account-value" id="login-\${index}">\${escapeHtml(acc.login)}</span>
                        <button class="copy-btn" onclick="copyText('login-\${index}', this)">Копировать</button>
                    </div>
                    <div class="account-row">
                        <span class="account-label">Пароль</span>
                        <span class="account-value" id="pass-\${index}">\${escapeHtml(acc.password)}</span>
                        <button class="copy-btn" onclick="copyText('pass-\${index}', this)">Копировать</button>
                    </div>
                </div>
            \`).join('');
        }

        function filterAccounts() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const filtered = sharedAccounts.filter(acc => acc.game.toLowerCase().includes(query));
            renderAccounts(filtered);
        }

        function copyText(elementId, btn) {
            const el = document.getElementById(elementId);
            if (!el) return;
            const text = el.textContent;
            const onSuccess = () => {
                btn.textContent = 'Скопировано!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = 'Копировать';
                    btn.classList.remove('copied');
                }, 1500);
            };
            const onError = () => {
                btn.textContent = 'Ошибка';
                setTimeout(() => { btn.textContent = 'Копировать'; }, 1500);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
                    if (fallbackCopy(text)) onSuccess(); else onError();
                });
            } else {
                if (fallbackCopy(text)) onSuccess(); else onError();
            }
        }

        function fallbackCopy(text) {
            try {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(ta);
                return ok;
            } catch (e) { return false; }
        }

        let cooldownTimer = null;
        function startCooldown() {
            const btn = document.getElementById('checkBtn');
            let remaining = 15;
            btn.disabled = true;
            btn.textContent = \`Подождите \${remaining}с...\`;
            if (cooldownTimer) clearInterval(cooldownTimer);
            cooldownTimer = setInterval(() => {
                remaining--;
                if (remaining <= 0) {
                    clearInterval(cooldownTimer);
                    cooldownTimer = null;
                    btn.disabled = false;
                    btn.textContent = 'Проверить';
                } else {
                    btn.textContent = \`Подождите \${remaining}с...\`;
                }
            }, 1000);
        }

        async function checkAccount() {
            const u = document.getElementById('username').value.trim();
            const p = document.getElementById('password').value.trim();
            const btn = document.getElementById('checkBtn');
            const res = document.getElementById('result');

            if (!u || !p) {
                res.className = 'result err'; res.textContent = 'Заполните все поля'; res.style.display = 'block'; return;
            }

            btn.disabled = true; btn.textContent = 'Проверка...'; res.style.display = 'none';

            try {
                const response = await fetch('/check', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p })
                });
                const data = await response.json();

                if (data.status === 'success') {
                    res.className = 'result ok'; res.textContent = 'Аккаунт работает';
                } else {
                    res.className = 'result err'; res.textContent = 'Аккаунт не работает';
                }
                res.style.display = 'block';
            } catch (error) {
                res.className = 'result err'; res.textContent = 'Ошибка сети'; res.style.display = 'block';
            } finally {
                startCooldown();
            }
        }
    </script>
</body>
</html>`;

async function checkSteamCredentials(username, password) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://steamcommunity.com/login/home/?goto=',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://steamcommunity.com'
    };

    let rsaData;
    try {
        const rsaResponse = await axios.get('https://steamcommunity.com/login/getrsakey', { params: { username }, headers, timeout: 10000 });
        rsaData = rsaResponse.data;
    } catch (error) { return { status: 'error' }; }

    if (!rsaData.success) return { status: 'error' };

    let encryptedPasswordB64;
    try {
        const modBuf = Buffer.from(rsaData.publickey_mod, 'hex');
        const expBuf = Buffer.from(rsaData.publickey_exp, 'hex');

        function derLength(len) {
            if (len < 128) return Buffer.from([len]);
            const bytes = []; let l = len;
            while (l > 0) { bytes.unshift(l & 0xff); l >>= 8; }
            return Buffer.from([0x80 | bytes.length, ...bytes]);
        }
        function derTag(tag, content) { return Buffer.concat([Buffer.from([tag]), derLength(content.length), content]); }
        function derInteger(buf) {
            if (buf.length > 0 && (buf[0] & 0x80)) buf = Buffer.concat([Buffer.from([0x00]), buf]);
            return derTag(0x02, buf);
        }
        function derSequence(items) { return derTag(0x30, Buffer.concat(items)); }
        function derBitString(content) { return derTag(0x03, Buffer.concat([Buffer.from([0x00]), content])); }
        function derOid(oidBytes) { return derTag(0x06, oidBytes); }
        function derNull() { return Buffer.from([0x05, 0x00]); }

        const rsaPublicKey = derSequence([derInteger(modBuf), derInteger(expBuf)]);
        const algorithmIdentifier = derSequence([derOid(Buffer.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01])), derNull()]);
        const subjectPublicKeyInfo = derSequence([algorithmIdentifier, derBitString(rsaPublicKey)]);
        const b64 = subjectPublicKeyInfo.toString('base64');
        const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

        const encrypted = crypto.publicEncrypt({ key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(password, 'utf-8'));
        encryptedPasswordB64 = encrypted.toString('base64');
    } catch (error) { return { status: 'error' }; }

    const payload = new URLSearchParams({
        username, password: encryptedPasswordB64, twofactorcode: '', emailauth: '', loginfriendlyname: '',
        captchagid: '-1', captcha_text: '', emailsteamid: '', rsatimestamp: rsaData.timestamp,
        remember_login: 'false', donotcache: Date.now().toString()
    });

    try {
        const loginResponse = await axios.post('https://steamcommunity.com/login/dologin/', payload.toString(), {
            headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000
        });
        const loginData = loginResponse.data;
        if (loginData.success) return { status: 'success' };
        return { status: 'error' };
    } catch (error) { return { status: 'error' }; }
}

app.get('/', (req, res) => res.send(HTML_TEMPLATE));

app.post('/check', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ status: 'error' });
    const result = await checkSteamCredentials(username.trim(), password.trim());
    res.json(result);
});

app.listen(PORT, '0.0.0.0', () => console.log(`Сервер запущен на порту ${PORT}`));
