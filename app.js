const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const activeSessions = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [id, lastSeen] of activeSessions.entries()) {
        if (now - lastSeen > 30000) activeSessions.delete(id);
    }
}, 10000);

const sharedAccounts = [
    { game: "UNCHARTED™: Legacy of Thieves Collection", login: "uncharted_st", password: "UNCHARTED@8804" },
    { game: "Forza Horizon 4, ARK Survival, LEGO Batman.", login: "nmsukt191", password: "batzaza191" },
    { game: "Black Myth Wukong", login: "gfk66337", password: "Acp234213" },
    { game: "Grand Theth Auto 5, Resident Evil 2, Resident Evil 3, Ведьмак 3: Дикая Охота.", login: "0855j9", password: "zZ10301030" },
    { game: "Marvel's Spider Man 2", login: "groggymovement4", password: "DCN_LliOQhv" },
    { game: "Red Dead Redemption 2", login: "ynysa422", password: "@Gamerspace123" },
    { game: "NBA 2K20, Grand Theth Auto San Andreas, Grand Theth Auto 5.", login: "rnmiike", password: "THEGODMIKE1" },
    { game: "Marvel's Spider Man Remastered", login: "mklvn2y9", password: "zhizhure1221" },
    { game: "The Last Of Us 2 Remastered, The Last Of Us Remastered, Geometry Dash, Resident Evil 2, 3, 4.", login: "STEAMGAMESTT1", password: "funpay.com/users/6932278/" },
    { game: "Hogwarts Legacy", login: "nicasacracacenri", password: "EBA9Y59KGCTB" },
    { game: "Resident Evil 7 Biohazard", login: "jocuriargenrinia", password: "70Games.net92" },
    { game: "Grand Theft Auto 4", login: "wqm322495", password: "ac7QPfa3" },
    { game: "Horizon Forbidden West Complete Edition", login: "vonterr", password: "889162" },
    { game: "Cyberpunk 2077", login: "orderlyinoculat", password: "axQUk8etMajK" },
    { game: "Dying Light 2 Stay Human, Dying Light, Sons Of The Forest, The Forest, Forza Horizon 4.", login: "earthlnwza5566", password: "2G6TEM5ZAZC6" },
    { game: "Euro Truck Simulator 2", login: "nfpprsq3h", password: "f1qslg5kp" },
    { game: "Atomic Heart.", login: "wf6ju3bf5wc3", password: "qKnh6N9SLiMxyvXVX36d" },
    { game: "Forza Horizon 5", login: "bej01201", password: "Bejdw11201" },
    { game: "Call Of Duty Modern Warfare 2, Efootball Pes 2021.", login: "dimkoxd", password: "2G6TEM5ZAZC6" },
    { game: "Mortal Kombat 11, Euro Truck Simulator 2", login: "steam123z17", password: "ZXCVBNMQQ" },
    { game: "Mortal Kombat 1", login: "Mortalk1pehkflt01", password: "TGVBFRETt01" },
    { game: "Farming Simulator 25", login: "neylavewe1985", password: "wFbmEcKQ" },
    { game: "Все части игр Metro, Sons Of The Forest, Dying Light, Ведьмак 3 Дикая Охота, Mafia 2", login: "negri_pidor1488", password: "fjbjnoDEFSjkndfgzhjkoCDSA09" },
    { game: "FIFA 22", login: "xxyenlover", password: "34cv56BN" },
    { game: "Terraria, Baldi's Basics Classic Remastered.", login: "quincypugy", password: "0Heh%v4SSG" },
    { game: "Hearts Of Iron 4, Batman Arkham Asylum.", login: "meteprotr", password: "3D88ASX2AMCG" },
    { game: "Ведьмак 3: Дикая Охота, ARK Survival.", login: "thnavud1", password: "0641769856Za" },
    { game: "Call Of Duty Modern Warfare 2019, Marvel's Spider Man Remastered, Far Cry 3, Max Payne 3, Assassin's Creed 3.", login: "soham123419", password: "Funpay-0nibist" },
    { game: "The Forest, Outlast 2.", login: "hhied98481", password: "Deaiwoq217" },
    { game: "Detroit: Become Human", login: "Detroit_st", password: "DETROIT@7401" },
    { game: "Resident Evil 4 Remake", login: "bejdw24074", password: "steamkk.com" },
    { game: "Dying Light, Euro Truck Simulator 2, Left 4 Dead 2.", login: "YaKrycheVasFP", password: "VM@KLGT8W34C" },
    { game: "Forza Horizon 5 + все DLC", login: "pq3sz8ar9rx8", password: "SZ7ZF8YSFCXE" },
    { game: "Call Of Duty Black Ops 3", login: "xbeverysketch", password: "st3@mxx645" },
    { game: "FIFA 21, FIFA 22", login: "rd5977", password: "951753852.ACHU" },
    { game: "Days Gone, Ea Sports FC 24, Grand Theth Auto 5", login: "juscelinolira", password: "CDTBTD66XEX6" },
    { game: "Sons Of The Fores, The Forest, Shedule, R.E.P.O, Hitman Absolution.", login: "SDACHAvARENDY01", password: "$j2si2jLDSJFJ2Nsj" },
    { game: "Elden Ring, Ведьмак 3.", login: "shushi_elden_ring", password: "Owner_shushiGames_Seller" },
    { game: "Red Dead Redemption 2, Ведьмак 3.", login: "red_dead_profix", password: "DASjsaj72ow8" },
    { game: "Call Of Duty Modern Warfare 3, GTA 4, Call Of Duty Modern Warfare 2, Call Of Duty Black Ops.", login: "sunzshiine", password: "msmb1122" },
    { game: "Call Of Duty WW2", login: "pandagame4418", password: "cod1452141" },
    { game: "Silent Hill 2", login: "aboodack", password: "DC5Z25E465DX" },
    { game: "Battlefield 5, ARK Survival.", login: "zhangben6662", password: "BNKGTsnMWu" },
    { game: "Metro Last Light Redux, Metro Exodus, Cyberpunk 2077, The Forest, Miside.", login: "cyberhitler1488", password: "Bbuv837FSgnB2" },
    { game: "Ghost Of Tsushima", login: "gihmt99337", password: "my_funpay_dtgame" },
    { game: "Black Myth Wukong", login: "mario_wukong", password: "QCP7PFHMW4VV" },
    { game: "Assetto Corsa, Euro Truck Simulator 2, City Car Driving, My Summer Car.", login: "ShezyyyFunPay", password: "funpay.com/users/8943271/" },
    { game: "Metro Exodus и ещё куча других крутых игр.", login: "opgarpstore1", password: "safEA24O-" },
    { game: "Marvel's Spider Man Miles Morales, Hello Neighbor.", login: "polszymek123", password: "Funpay-Onibist1" },
    { game: "Mafia 2 Definitive Edition, The Elder Scrolls 5 Skyrim.", login: "hazer3", password: "S2477TT27EC6" },
    { game: "NBA 2K22", login: "Shixize1", password: "PwxcoNGgFM" },
    { game: "Mafia Definitive Edition, Mafia 3. Mafia 2 Definitive Edition.", login: "sss0614", password: "Mafia$75" },
    { game: "BeamNG.drive", login: "mbig4912", password: "Eb2PLbZ3" },
    { game: "Sekiro Shadows Die Twice.", login: "05796591", password: "Derkyt111666" },
    { game: "Hogwarts Legacy, Ghost Of Tsushima.", login: "nrbon69177", password: "meisonlyme1A" },
    { game: "DayZ.", login: "amlv63032", password: "CExXMoJXF1TU" },
    { game: "God Of War, Tomb Rider.", login: "mayli1001", password: "MqPN05kcpk89" },
    { game: "Kingdom Come Deliverance 2.", login: "phvmg47604", password: "bfmjj99570" },
    { game: "Doom The Dark Ages.", login: "fdsfdsfds9824", password: "x2jrrd7mef3jqSX" },
    { game: "God Of War Ragnarok.", login: "dart1997", password: "YXJYS80P7164" },
    { game: "Clair Obscur Expedition 33.", login: "dgb236444", password: "tjjn248562" },
    { game: "The Last Of Us Remastered", login: "hiyondw615", password: "sp9wyq8s" },
    { game: "Lego Harry Potter, Elden Ring, Cuphead, Hitman 2, Terraria, Geometry Dash.", login: "Thragg_767", password: "ev8Z5YyvY42RmiX" },
    { game: "CyberPunk 2077.", login: "mardiprawdziwy", password: "G4market999" },
    { game: "Marvel's Spider Man Remastered, Marvel's Spider Man Miles Morales.", login: "NEW2SPIDERSMANOFF581", password: "jMc3rP#=lBu{43fz{-v" },
    { game: "Grand Theth Auto 5, Rust, Among Us.", login: "RsgKingz", password: "Deshawn2010$" },
    { game: "Gta Vice City, Hitman 2, Hitman Absolution, Fallout 3.", login: "ihhza24z", password: "4ytb9naa" },
    { game: "Black Myth Wukong.", login: "8782146147", password: "Derkytt090934" },
    { game: "Forza Horizon 5.", login: "wbtq1089352", password: "steamok778899" },
    { game: "Stalker Shadow Of Chornobyl.", login: "74gub9322di6", password: "tjjn248562" },
    { game: "Silent Hill 2 Remake.", login: "xd7e5b", password: "djCZiNsY" },
    { game: "Cyberpunk 2077, Metro Exodus, Mafia.", login: "necros13579", password: "13579zef" },
    { game: "Forza Horizon 4.", login: "pf7yq3uu8ry9", password: "Tu2Ww3Uk1Ok6" },
    { game: "60 Seconds Reatomized.", login: "ghuzn91928", password: "PexhPCWAW4" },
    { game: "Grand Theth Auto 5, Forza Horizon 5, Assetto Corsa.", login: "uihgee2505", password: "g1r506wh1a56wehr106" },
    { game: "Cuphead.", login: "su0wn1hf", password: "UOipTT58vG5XZ1" },
    { game: "Elden Ring Nightreign.", login: "gaonengDW77703", password: "05698748" },
    { game: "The Last Of Us 2 Remastered.", login: "k8ef0k53f", password: "RaysShopAkk!2" },
    { game: "Hello Neighbor.", login: "markoparada2011", password: "5https://t.me/steamiq" },
    { game: "NBA 2K25.", login: "kk80401", password: "kk223344kkwdw" },
    { game: "Black Myth Wukong.", login: "mario_wukong", password: "QCP7PFHMW4VV" },
    { game: "Far Cry 5, FIFA 22, Far Cry 3.", login: "paraguaapeek", password: "2deenerodel2003" },
    { game: "Don't Starve Together, Black Myth Wukong, Forza Horizon 4.", login: "34095617", password: "YDMBXMK7EK3K" },
    { game: "Crysis 3 Remastered.", login: "fpfuryfamily", password: "thxfp362" },
    { game: "God Of War Ragnarok.", login: "cretosesat1971", password: "JYQaFwd7zh" },
    { game: "Ghost Of Tsushima, Dying Light The Beast и много других крутых игр!", login: "moguchichlen228", password: "JBVAo_432fe1f" },
    { game: "Forza Horizon 4, Cyberpunk 2077 и много других крутых игр.", login: "fk1xo6tz8bt7", password: "cTiAP4Jh3xfW" },
    { game: "Dead Island 2, Dying Light.", login: "fpsquimeeminon1", password: "funpaysquimeeminon2" },
    { game: "Resident Evil Requiem", login: "ffpsw21350", password: "funpaytop_33" },
    { game: "Rain World", login: "steamok100893", password: "steamok100885" },
    { game: "Resident Evil Requiem", login: "genpestovy6nh41", password: "siski3623HHfkFaAz264" },
    { game: "God Of War Ragnarok", login: "ragnarok_byheero", password: "https://t.me/steamaccountsog" },
    { game: "Terraria", login: "04c4ifka", password: "marpanov" },
    { game: "Hello Neighbor 2", login: "mylann_flashh", password: "31https://t.me/steamiq" },
    { game: "Stalker 2 Heart Of Chornobyl", login: "statalalal1971", password: "8ia1uejk" },
    { game: "Resident Evil 4 Remake", login: "iinnjj4759", password: "3dE6wjsplay" },
    { game: "Little Nightmares", login: "adlyangel2", password: "a1b9c3wq" },
    { game: "The Last Of Us Remastered", login: "pakinta", password: "www.pokopow.com" },
    { game: "Snowrunner", login: "dedqs21651", password: "FrZ78mgY" },
    { game: "Call Of Duty Modern Warfare 2", login: "bababagob555", password: "027535503" },
    { game: "Borderlands 1", login: "220788844", password: "046741243" },
    { game: "Outlast Trials", login: "wered171", password: "https://funpay.com/users/13462512/" },
    { game: "Grand theft auto San Andreas", login: "joelal123", password: "Bigboss007@" },
    { game: "Mudrunner", login: "yuchen3024", password: "zhengdacong01" },
    { game: "Resident Evil, Metro, Doom, Dying Light, Hitman, Dark Souls, The Witcher, Skyrim", login: "gagagugu1254", password: "polpolpol09" },
    { game: "Red Dead Redemption 2", login: "miro97790405", password: "marpanov_free20" },
    { game: "Besiege", login: "offl1neman", password: "P@1dbyMan" },
    { game: "Valheim, City Car Driving, Hitman 2, Metro 2033 Redux + другие игры", login: "crew_utpiaplay24", password: "Gogbokonch!78" },
    { game: "Granny Remake", login: "kewbt36891", password: "FunPaySAPOZNIK" },
    { game: "MX Bikes", login: "xbglp85313", password: "cnkf64372Y" },
    { game: "Hogwarts Legacy", login: "hros1kshopp", password: "Hros1kShop!1" },
    { game: "Battlefield 4 Premium Edition", login: "xxd3m3nt0rxx", password: "3158752610E" },
    { game: "Resident evil requiem", login: "Gf5sa4241", password: "1https://funpay.com/users/14002680/" },
    { game: "Серия Call Of Duty", login: "stillyn", password: "Asdzxc1234)))))" },
    { game: "Call Of Duty:Infinite Warfare", login: "maxiek_d", password: "ZZZZZrr1310" },
    { game: "Resident Evil 4", login: "blue_magician_", password: "B2A2ZC656T3M" },
    { game: "Microsoft flight simulator 2024", login: "antonioralph1972ff", password: "0Oe!brsaxqsn2206" },
    { game: "Ghost Of Tsushima", login: "pakinta", password: "www.pokopow.com" },
    { game: "Dying Light The Beast", login: "ejhd2464", password: "gnww246422" },
    { game: "Gas Station Simulator", login: "gbd_dev", password: "GO2Apple2022" },
    { game: "Серия Metro +DLC", login: "GluttonyMorica312", password: "EFUldfejirlwyu649odj" },
    { game: "Mortal Kombat + Tekken", login: "wsgln795693", password: "7LERANDR@BAW!@" },
    { game: "Squad", login: "izyd_", password: "zeyd14jst" },
    { game: "Mafia II + DE", login: "dinobozz1", password: "ZI5XqvhDMhpOhaQRfgQCo" },
    { game: "Spider man Remastered + Miles Morales", login: "johnlopez217", password: "funpayChainz96" },
    { game: "The Elder Scrolls Skyrim 5 Special Edition, Ведьмак 3", login: "gagagugu1254", password: "polpolpol09" },
    { game: "Wallpaper Engine", login: "ruiiixx", password: "S67GBTB83D3Y" },
    { game: "God of war Ragnarok", login: "qavix221", password: "playerok.com/profile/QAVIX" },
    { game: "Escape the Backrooms", login: "offl1neman", password: "P@1dbyMan" },
    { game: "Repo + Terraria", login: "attrth11", password: "zxc333Yaa" },
    { game: "Half life 1/2 + Postal 1/2", login: "wered171", password: "https://funpay.com/users/13462512/" },
    { game: "Poppy Playtime (All Chapters)", login: "poppyxiajsh", password: "playerok.com/profile/QAVIX" },
    { game: "Microsoft Flight Simulator 2020", login: "Dovyrth", password: "Nzkahdn97" },
    { game: "Friday the 13th", login: "xwk1998", password: "senha2019" },
    { game: "Assetto Corsa", login: "wbtq1085833", password: "steamok222111" },
    { game: "Cyberpunk 2077", login: "pp29icpg", password: "RRayane66" },
    { game: "Sunkenland", login: "swcmzd", password: "Sw758982" },
    { game: "Accident", login: "mastergamer9901", password: "supergamerscp" },
    { game: "Farming Simulator 22", login: "aurelie_8283", password: "8DDE8XKS8GSK" },
    { game: "Call Of duty Black Ops III + игры", login: "john_bubbles666", password: "Slipperfeet55" },
    { game: "Серия Fallout", login: "folomon55x", password: "kolobok44884" },
    { game: "Far Cry 3-6 + Metro", login: "pfzpy98380", password: "Wjuyk63519-" },
    { game: "GTA 5 Premium", login: "doona242", password: "CandyShell" },
    { game: "Grand Theft Auto San Andreas", login: "joelal123", password: "Bigboss007@" },
    { game: "Call of Duty: Black Ops, Call of Duty: Black Ops Multiplayer, Call of Duty: Black Ops II, Call of Duty: Black Ops II Multiplayer, Call of Duty: Black Ops II Zombies, Call of Duty: Black Ops III, Mad Max, SUPERHOT, SUPERHOT: MIND CONTROL DELETE, The Elder Scrolls V: Skyrim, PIPE, Dead Rising 2, Saints Row: The Third, Saints Row IV: Re-Elected, Serial Cleaner, Just Cause 3, Spec Ops: The Line, Goat Simulator, PAYDAY 2, Apex Legends", login: "john_bubbles666", password: "Slipperfeet55" },
    { game: "Серия Fallout", login: "folomon55x", password: "kolobok44884" },
    { game: "Call Of Duty Modern Warfare 3", login: "lady_jess1", password: "27https://t.me/steamiq" },
    { game: "Accident The Pilot", login: "onsrk052", password: "chengyu456565" },
    { game: "The Last of Us™ Part II RemasteredStellar Blade™ WUCHANG: Fallen FeathersBeam Ng Drive", login: "mutnr91844", password: "dolus86-FunPAy" },
    { game: "Watch Dogs Legion", login: "fendtking", password: "johndeere6215r" },
    { game: "Farming Simulator 25", login: "Mariofs251", password: "Digital1813" },
    { game: "Portal 1/2", login: "hros1kshopp", password: "Hros1kShop!1" },
    { game: "Silent Hill F", login: "dedqs21651", password: "FrZ78mgY" },
    { game: "Grand Theft Auto V", login: "muqy37399", password: "aj6ry4y7c" },
    { game: "Teardown", login: "qavix2231", password: "playerok.com/profile/QAVIX" },
    { game: "Fallout 4 & Shelter", login: "swfushe4", password: "Sw654247" },
    { game: "Don't Starve Together", login: "onlykickf313", password: "70Games.net145" },
    { game: "Don't Starve", login: "lsllu803", password: "cln354946W" },
    { game: "Spintires", login: "amir007576609", password: "Amir00757" },
    { game: "Tekken 7 + Battlefield 1", login: "zacsef132", password: "2cool4school@" },
    { game: "Stray", login: "pmrh73716", password: "chengyu2444477" },
    { game: "Mafia Definitive Edition (+хорошая библиотека)", login: "Lkuyg12", password: "17789567Qjsu1" },
    { game: "Resident Evil Requiem", login: "caigamer_cn_re9_2", password: "caiGamer.cn" },
    { game: "Baldur’s Gate 3", login: "shareourlives5", password: "share_our_lives." },
    { game: "Five Nights At Freddy's Security Breach", login: "fernando3578546", password: "fer20082021" },
    { game: "Schedule 1", login: "fifj10864", password: "Rogerard7676" },
    { game: "Subnautica 1-2", login: "hfsdfz", password: "xvdgfghfh" },
    { game: "Dying Light The Beast", login: "ejhd2464", password: "gnww246422" },
    { game: "My Summer Car", login: "ShezyyyFunPay", password: "funpay.com/users/8943271/" },
    { game: "Marvel's Spider Man Miles Morales", login: "cnykqx48s", password: "Progamer@" },
    { game: "Doom Eternal(+хорошая библиотека😋)", login: "porlik567", password: "q3ergiuhK_41" },
    { game: "Mafia 2 Definitive Edition +Classic", login: "dinobozz1", password: "ZI5XqvhDMhpOhaQRfgQCo" },
    { game: "Jurassic World Evolution 2", login: "danny_cjo", password: "995658364Dcjo" },
    { game: "Mafia The Old Country", login: "mkhh0693", password: "wxsr4347" },
    { game: "Batman Arkham City(+Arkham Asylum)", login: "hongchen8821", password: "hongchen11523" },
    { game: "Marvel's Spider Man 2", login: "sumptuoustypolo2", password: "ZZZZZrr132" },
    { game: "Warhammer 40000 Space Marine 2", login: "nszbi26074", password: "exwgp64749" },
    { game: "Factorio", login: "precisedisadvan", password: "Nocker76*" },
    { game: "Resident Evil Requiem", login: "Porlik567", password: "q3ergiuhK_41" },
    { game: "Pay Day 2", login: "brurocker", password: "bruno123" },
    { game: "Marvel's Guardians of the Galaxy", login: "ni9rvz0j", password: "chengyu445567" },
    { game: "Sekiro Shadow Die Twice", login: "by_heero", password: "https://t.me/steamaccountsog" },
    { game: "Supermarket Simulator", login: "roeor86081", password: "eowz52837B" },
    { game: "Mafia 3", login: "jumala_is_back", password: "9XZtDnzmp0Ms" },
    { game: "Little Nightmares 3", login: "dbqwd83332", password: "kvjvo89167" },
    { game: "Reanimal", login: "ath775292", password: "UtE670214" },
    { game: "Buckshot Roulette", login: "bagshototmonstra", password: "INngvjieb3423@" },
    { game: "Hitman 2", login: "bas_suurland@hotmail.com", password: "u4r9omZo2MW3L4J" },
    { game: "Firefighting Simulator The Squad", login: "qnlrs88225", password: "Kukimaki18" },
    { game: "Black Myth Wukong + Clair Obscur Expedition 33(хорошая библиотека😋)", login: "bando_loves_boobs", password: "fpcandyshell123" },
    { game: "Naruto Shippuden Ultimate Ninja Storm 4", login: "tanwakon", password: "30https://t.me/steamiq" },
    { game: "Mount & Blade 2 Bannelord", login: "qimayukanha22", password: "faffasf4554" },
    { game: "Call Of Duty Modern Warfare 3 (2023)", login: "Iu8Yr7Gp5Oh6", password: "Ji6Nm2Fb7Bb3" },
    { game: "Hitman Absolution", login: "gggggggfsafdsa", password: "marpanov_free7" },
    { game: "People Playground", login: "steamok1090206", password: "steamok888777" },
    { game: "Metro 2033", login: "magepll", password: "marpanov_free16" },
    { game: "BeamNG.drive", login: "Ht7Zq6Ed8Ga1", password: "Tl0Jy8Gl9Fq5" },
    { game: "F1 2024", login: "igoa10919", password: "30https://t.me/steamiq" },
    { game: "Clair Obscur Expedition 33", login: "seventy_qroqobgf", password: "70xplay.com" },
    { game: "Call Of Duty WW2(+хорошая библиотека)", login: "arks62", password: "playerokTovarStoreRe" },
    { game: "Crimson Desert Deluxe Edition", login: "ehtkd33230", password: "vohhe98963" },
    { game: "Schedule 1", login: "fifj10864", password: "Rogerard7676" },
    { game: "BeamNG Drive", login: "ynhtvAede2vynh", password: "siski339cwU0Q5H3wWWRvb" },
    { game: "Cyberpunk 2077(+хорошая библиотека)", login: "vzooy75082", password: "auodt55959" },
    { game: "Dying Light The Beast", login: "ecvgz63808", password: "xeujn89038" },
    { game: "Uncharted 4: Legacy of Thieves Collection", login: "pokopowadventure", password: "www.pokopow.com#8392" },
    { game: "Call Of Duty Modern Warfare 2 (2022)", login: "uj5j45311", password: "FElvc5204" },
    { game: "The Crew Motorfest", login: "mqlfylzyhb@rambler.ru", password: "Mx2023!!9" },
    { game: "Postal 4 No Regerts", login: "lycnk701", password: "steamok0606" },
    { game: "Microsoft Fly Simulator и XPlane 12-11", login: "21flying", password: "Z2AKDCM3M6GZ" },
    { game: "Dying Light 2 Stay Human(+хорошая библиотека)", login: "thedrbld", password: "acc561209" },
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
    { game: "Resident Evil 4 Remake(+хорошая библиотека)", login: "rivalchik52", password: "VADIMCHIK228" },
    { game: "God Of War Ragnorok", login: "xyjba80543", password: "god511300" },
    { game: "Bodycam", login: "4ttbs8lh", password: "https://funpay.com/users/18318680/" },
    { game: "BeamNG.drive", login: "beamngfpaccusedd", password: "Funpayaccusedd." },
    { game: "Marvel's Spider Man Remastered", login: "rivalchik52", password: "VADIMCHIK228" },
    { game: "Cyberpunk 2077", login: "zttsl29092", password: "chjv42725G" },
    { game: "PRAGMATA", login: "Puzir8081", password: "Hx@836RvMa95E" },
    { game: "Black Myth Wukong", login: "tronghp1234", password: "Tronghp1232334@" },
    { game: "Days Gone(+хорошая библиотека)", login: "Qx9Tk9Nx0Ca1", password: "Pm0Ta0Zh8Wa5" },
    { game: "STALKER 2 Heart Of Chernobyl", login: "xvdgfghfh", password: "aojjr17797" },
    { game: "Crimson Desert", login: "oiato98547", password: "wvlyn58167" },
    { game: "Left 4 Dead 2", login: "skibiditopfunpayofflineaccaynt", password: "Safs@42352jkkdfsuefdsjeh@hu!ihsd" },
    { game: "Forza Horizon 5", login: "flusstim28893", password: "https://funpay.com/users/6442502/" },
    { game: "Pragmata", login: "cycxr66898", password: "Nekt0inoy" },
    { game: "Все части серии Metro", login: "frwzx76017", password: "https://funpay.com/users/16100391/" },
    { game: "ARC Raiders", login: "uzes79494", password: "Georgian326fg!" },
    { game: "Forza Horizon 5", login: "ux3zc4zm5ed5", password: "miraque0*" },
    { game: "Hello Neighbor(+хорошая библиотека)", login: "pucyhxul1809", password: "GGSEL_CopperS" },
    { game: "Horizon Forbidden West", login: "ForbiiiddenWest", password: "Forbidden2$4567" },
    { game: "Subnautica 2(+хорошая библиотека)", login: "umuyd62770", password: "pmo090710" },
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
    { game: "Очень много, не сосчитать ;)", login: "laszlovoros60", password: "pazalyhozo4688" },
    { game: "Resident Evil Requiem(+жирная библиотека)", login: "ricciganggame", password: "https://funpay.com/users/5644459/" },
    { game: "Ready Or Not", login: "ydic63676", password: "HouseReady1@" },
    { game: "The Last Of Us Part 2", login: "madishare11111", password: "79cBeTCpEZjABC_" },
    { game: "RX Riders Republic", login: "58786917", password: "25925863" },
    { game: "007 First Light", login: "Juj22485", password: "sf757376" },
    { game: "Uncharted The Legacy Of Thieves Collection", login: "fogmool", password: "Nutersonk43!" },
    { game: "Escape the Backrooms", login: "kmkaw84460", password: "33https://t.me/steamiq" },
    { game: "Call Of Duty Modern Warfare 2019", login: "financialscorpion39551", password: "n40saxt50yiyn4g!zru3b" },
    { game: "Stalker 2 Heart Of Chernobyl", login: "statalalal1971", password: "8ia1uejk" },
    { game: "God Of War Ragnorok", login: "ragnarok_byheero", password: "https://t.me/steamaccountsog" },
    { game: "Mon Bazou", login: "selfishsturgeon4899", password: "Sully!?09" },
    { game: "Farming Simulator 22", login: "aurelie_8283", password: "8DDE8XKS8GSK" },
    { game: "Meccha Chameleon", login: "klimflain234", password: "crTf(T%yY'sN-62" },
    { game: "Куча крутых игр, на любой вкус", login: "overfreak911", password: "yachertila" },
    { game: "Arma 3+неплохая библиотека", login: "berk1158", password: "arifkaya2007" },
    { game: "Farming Simulator 25", login: "yromadev1", password: "xDvTSb37UyBRsY" },
    { game: "Red Dead Redemption 2", login: "presidentialbandicoot8056", password: "f-r-e-e-akk-tg:@hyznet" },
    { game: "Все возможные части Call Of Duty", login: "march_2103", password: "x_plays111" },
    { game: "Subnautica", login: "6raymone23", password: "BilyjDeqqC" },
    { game: "Call Of Duty Modern Warfare 3 (2023)", login: "mmzjlo8x", password: "glIIsTNozyiu" },
    { game: "Pes 2019 & Pes 2016", login: "pes2019pes", password: "Pe$$ep97!" },
    { game: "Crysis 3 Remastered +хорошая библиотека", login: "frwzx76017", password: "https://funpay.com/users/16100391/" },
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
    { game: "Farming Simulator 22", login: "aurelie_8283", password: "8DDE8XKS8GSK" },
    { game: "Call Of Duty World At War, Call Of Duty Black Ops, Call Of Duty Black Ops 2, Call Of Duty Modern Warfare 2, Call Of Duty Modern Warfare 3, Counter Strike Source, Serious Sam 3", login: "stillyn", password: "Asdzxc1234)))))" },
    { game: "Ready Or Not", login: "mj09uq5kw", password: "KKg0xvKyzVNs6y" },
    { game: "Call Of Duty Modern Warfare (2019), Combat Master Season 5, Skate.", login: "financialscorpion39551", password: "n40saxt50yiyn4g!zru3b" },
    { game: "Horizon Zero Down Complete Edition, Cyberpunk 2077, Drift Legends 2, Space War", login: "alridergans1985", password: "qJgS2p5PEL1992" },
    { game: "Hollow Knight Silksong, Hollow Knight, Crimson Desert, Dying Light, Mafia 2, The Last Of Us Part 1, Resident Evil Requiem", login: "ricciganggame", password: "https://funpay.com/users/5644459/" },
    { game: "FIFA 22, ARK Survival Evolved", login: "marianalvarezzz1992", password: "Yanier1992" },
    { game: "Hogwarts Legacy, WRC 7, WRC 5", login: "zon_jb", password: "Tomteland98" },
    { game: "Mortal Kombat X, Mortal Kombat 11, Detroit Become Human, Crysis 3 Remastered, Crysis 2 Remastered, Outlast, The Forest, Sons Of The Forest, Dishonored, The Long Dark, City Car Driving", login: "neffffffffex", password: "https://funpay.com/users/17414395/" },
    { game: "Resident Evil 2 Remake", login: "shenghuaweiji2a", password: "Hh6039512a" },
    { game: "God Of War 2018+фурри игры", login: "oiydz866", password: "chengyu456778" },
    { game: "Call Of Duty Vanguard, Hello Neighbor", login: "tozinabro1977", password: "2CH4bGOe6S1978" },
    { game: "EA Sports FIFA 23, Euro Truck Simulator 2, Pes 2016", login: "coranhart", password: "H9mqE6og31" },
    { game: "Grid 2, BeamNG.drive, Sleeping Dogs Definitive Edition, Dead By Daylight, Just Cause 2, Prince Of Persia Warrior Within, Prince Of Persia The Two Thrones, Prince Of Persia The Sands Of Time, Euro Truck Simulator 2, Marvel's Midnight Suns, TEKKEN 7, Among Us, NBA 2K20, Shadow of The Tomb Rider, Uncharted 4, Hitman 2, Garry's Mod, Hellblade: Senua's Sacrifice, Left 4 Dead 2, Call Of Duty WW2, Asetto Corsa 2, Mafia Definitive Edition, Mafia 2, Mafia 2 Definitive Edition, Mafia 3, Batman Arkham City, The Forest, The Elder Scrols 4: Oblivion, The Elder Scrols 5: Skyrim, Just Cause 3, Heart Of Iron 4, Lego Marvel Super Heroes, Mortal Kombat 11, Batman Arkham Knight, Batman Arkham Origins, Kingdome Come Deliverence", login: "ba1aq2qp1fq4", password: "Gf9Jr5Oh1Ek9" },
    { game: "Mortal Kombat 11", login: "mortalkombat11sharing", password: "mortalkombat112019" },
    { game: "Snow Runner, Left 4 Dead 2, Rust", login: "lsoiy210", password: "lwl67033R" },
    { game: "Mud Runner, Cities Skylines, SnowRunner, Euro Truck Simulator 2, Left 4 Dead 2, The Forest, Stardew Valley, Borderlands 2, Terraria, Car Mechanic Simulator 2018, Battlefield 1, Green Hell", login: "tczfy83308", password: "HE1092618" },
    { game: "Arma 2, Left 4 Dead 2", login: "supersuper61", password: "coelho2015" },
    { game: "Call Of Duty Modern Warfare 2 (2022)", login: "uexq59805", password: "jjackson14" },
    { game: "007 First Light, Forza Horizon 6, Lego Batman Legacy Of The Dark Knight", login: "bcaxo55681", password: "noyyb36531" },
    { game: "NBA 2K26, Skate.", login: "ofyxw04053", password: "uixay83374" },
    { game: "Meccha Chameleon", login: "ydtdo32097", password: "PzIf3P1GXw2dEJ" },
    { game: "Grand Theft Auto San Andreas, Grand Theft Auto 5 Enhanced, Euro Truck Simulator 2, Left 4 Dead 2, Bus Simulator 2012, Microsoft Flight Simulator X, Transport Fever 2", login: "joelal123", password: "Bigboss007@" },
    { game: "R.E.P.O", login: "anthonykelly1972", password: "TovarStore123" },
    { game: "The Forest, Among Us", login: "wbtq1083464", password: "steamok45785112" },
    { game: "Cyberpunk 2077, Mafia The Old Country, The Last Of Us Remastered, Forza Horizon 4, Shedule 1, Sons Of The Forest, Hearts Of Iron 4, Resident Evil 4 Remake, Resident Evil 2 Remake, Outlast, Days Gone, Mafia 3, Mafia 2, Mafia Definitive Edition, Metro 2033, Metro Exodus, God Of War (2018), Detroit Become Human, Stalker Shadow Of Chernobyl, Ведьмак 3 Дикая Охота, Dying Light, The Witcher Enhanced Edition, The Witcher 2 Enhanced Edition, Pay Day 2, Euro Truck Simulator 2", login: "toto121aktiva", password: "afkaweo9312jfia0" },
    { game: "Call Of Duty Modern Warfare (2019)", login: "financialscorpion39551", password: "n40saxt50yiyn4g!zru3b" },
    { game: "Mortal Kombat 1, Mortal Kombat 11, Mortal Kombat X", login: "SkizeGames13801MK1", password: "www.skizegames.store" },
    { game: "Bodycam, Dead By Daylight, Dead Island 2", login: "s6242xmx", password: "IZNnSgUjrbdK" },
    { game: "Horizon Zero Dawn Complete Edition", login: "jollyrojer919", password: "offlineactivator919" },
    { game: "Resident Evil Requiem", login: "dedqs21651", password: "FrZ78mgY" },
    { game: "Farming Simulator 19, Euro Truck Simulator 2", login: "zazaxe4", password: "37191610z" },
    { game: "Grand Theft Auto 5 Enhanced, Grand Theft Auto 5 Legacy", login: "kostagjorcepetrov", password: "marpanov_free15" },
    { game: "Trailmakers", login: "steamok1089916", password: "steamok765567" },
    { game: "Farming Simulator 17, Spin Tires, Stable Guys", login: "stimgamerfarmingsymulator2017", password: "steamgamer321fs!2017" },
    { game: "The Binding Of Isaac Rebirth", login: "wbtq1086053", password: "steamok987789" },
    { game: "Sniper Elite 5, Sniper Elite 4", login: "ooSniperDeluxeoo", password: "DEL9OElite8Sniper9" },
    { game: "Five Night's at Freddy's Secret Of Mimic", login: "fredglover1960", password: "nqszzger9229$!1v0" },
    { game: "NBA 2K26", login: "Ds2Im2Nk3Gy2", password: "Ud9Mw0Mo7Iu7" },
    { game: "Rust", login: "zgejcplxny", password: "tvzE3igz2A" },
    { game: "EA Sports FIFA 22", login: "marianalvarezzz1992", password: "Yanier1992" },
    { game: "Forza Horizon 5", login: "funnymassivepony08", password: "Roundkick991XME342" },
    { game: "Five Nights At Freddy's", login: "zuopy28956", password: "elib56353E" },
    { game: "Grand Theft Auto 5 Legacy, Grand Theft Auto 5 Enhanced", login: "wecd820201", password: "dddQIK2Yb" },
    { game: "Death Stranding 2 On The Beach", login: "wgum29vkmrnjv", password: "raRN9AGCUPljKdlSL4" },
    { game: "Uncharted Legacy Of Thieves Collection", login: "ao0na8xp5yp2", password: "Mn6Ld9Ex1Fr8" },
    { game: "Stalker 2 Heart Of Chernobyl", login: "zalobechi1983", password: "NJLZ4LWNTY1989" },
    { game: "Stray", login: "pmrh73716", password: "chengyu2444477" },
    { game: "Far Cry 1-2, Far Cry 3, Far Cry 4, Far Cry 5, Far Cry 6", login: "farcryxiajsh", password: "playerok.com/profile/QAVIX" },
    { game: "Construction Simulator", login: "probunloti1982", password: "an41526kx" },
    { game: "BeamNG.drive", login: "Ht7Zq6Ed8Ga1", password: "Tl0Jy8Gl9Fq5" },
    { game: "Hello Neighbor 2, Hello Neighbor, Miside", login: "Direp12", password: "112314533Q" },
    { game: "Ghost Of Tsushima, Far Cry 6, Call Of Duty Modern Warfare 2 (2022)", login: "sfsefawd", password: "sef435$%#" },
    { game: "God Of War (2018)", login: "oiydz866", password: "chengyu456778" },
    { game: "Subnautica 2", login: "codl39195", password: "Pt5Ac2Fu8Yf66t" },
    { game: "Assetto Corsa", login: "babai0_02", password: "Kasra.0919" },
    { game: "Lego Marvel Super Heroes", login: "twistnewold", password: "5sMgwST4L5j" }
];

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Steam Tools</title>
    <style>
        :root {
            --bg: #0a0b10; --card: rgba(27, 30, 38, 0.7); --text: #e0e0e0;
            --text-muted: #8b92a1; --accent: #66c0f4; --accent-glow: rgba(102, 192, 244, 0.3);
            --ok: #00ff88; --err: #ff3355; --warn: #ffaa00; --tg: #2AABEE;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(102, 192, 244, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(255, 51, 85, 0.05) 0%, transparent 40%);
            color: var(--text); display: flex; justify-content: center; align-items: center;
            min-height: 100vh; padding: 20px;
        }
        .container {
            background: var(--card); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            padding: 2.5rem; border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
            width: 100%; max-width: 420px; text-align: center; position: relative;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-tabs { display: flex; gap: 8px; margin-bottom: 1.5rem; background: rgba(15, 16, 20, 0.6); padding: 4px; border-radius: 12px; }
        .nav-tab { flex: 1; padding: 10px; text-align: center; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-muted); transition: 0.2s; font-size: 0.9rem; }
        .nav-tab.active { background: var(--accent); color: #0a0b10; }
        
        .view-section { display: none; }
        .view-section.active { display: block; animation: fadeIn 0.3s ease; }

        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        h2 { margin: 0; color: var(--accent); text-transform: uppercase; font-size: 1.1rem; letter-spacing: 2px; font-weight: 700; }
        .online-badge { display: flex; align-items: center; gap: 6px; background: rgba(0, 255, 136, 0.1); color: var(--ok); padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 255, 136, 0.2); }
        .online-dot { width: 8px; height: 8px; background: var(--ok); border-radius: 50%; animation: pulse 2s infinite; }
        
        .input-group { position: relative; margin-bottom: 1.2rem; }
        input { width: 100%; padding: 14px 16px; background: rgba(15, 16, 20, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; color: white; font-size: 1rem; outline: none; transition: all 0.3s ease; }
        input::placeholder { color: var(--text-muted); }
        input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); background: rgba(15, 16, 20, 0.9); }
        
        button.action-btn { width: 100%; padding: 14px; margin-top: 0.5rem; background: linear-gradient(135deg, var(--accent) 0%, #4a9fd4 100%); color: #0a0b10; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(102, 192, 244, 0.2); }
        button.action-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 192, 244, 0.4); }
        button.action-btn:active:not(:disabled) { transform: translateY(0); }
        button.action-btn:disabled { background: #2a2e38; color: #666; cursor: not-allowed; box-shadow: none; }
        
        #result { margin-top: 1.5rem; padding: 14px; border-radius: 10px; font-weight: 700; font-size: 1rem; display: none; animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); text-transform: uppercase; letter-spacing: 1px; }
        .success { background: rgba(0, 255, 136, 0.1); color: var(--ok); border: 1px solid rgba(0, 255, 136, 0.3); }
        .error { background: rgba(255, 51, 85, 0.1); color: var(--err); border: 1px solid rgba(255, 51, 85, 0.3); }
        .captcha { background: rgba(255, 170, 0, 0.1); color: var(--warn); border: 1px solid rgba(255, 170, 0, 0.3); text-transform: none; letter-spacing: 0; font-weight: 600; font-size: 0.95rem; }
        
        #captchaSection { display: none; margin-top: 1.5rem; padding: 1.2rem; background: rgba(15, 16, 20, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); animation: slideDown 0.4s ease; }
        #captchaSection p { margin: 0 0 10px 0; color: var(--warn); font-size: 0.9rem; font-weight: 600; }
        #captchaImage { max-width: 100%; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1); background: #fff; }
        
        .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin-top: 1rem; max-height: 400px; overflow-y: auto; padding-right: 4px; }
        .accounts-grid::-webkit-scrollbar { width: 6px; }
        .accounts-grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .account-card { background: rgba(15, 16, 20, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 12px 8px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .account-card:hover { border-color: var(--accent); transform: translateY(-2px); background: rgba(102, 192, 244, 0.05); }
        .account-card h3 { font-size: 0.85rem; margin: 0; color: var(--text); font-weight: 600; line-height: 1.3; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: none; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
        .modal-overlay.active { display: flex; }
        .modal-content { background: var(--card); padding: 2rem; border-radius: 16px; width: 100%; max-width: 380px; border: 1px solid rgba(255,255,255,0.1); animation: popIn 0.3s ease; text-align: left; }
        .modal-title { text-align: center; color: var(--accent); font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px; }
        .copy-row { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
        .copy-row label { width: 70px; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
        .copy-row input { flex: 1; margin: 0; font-family: monospace; font-size: 0.85rem; padding: 10px 12px; }
        .copy-btn { width: auto; padding: 10px 12px; margin: 0; background: rgba(255,255,255,0.1); color: var(--text); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 0.8rem; }
        .copy-btn:hover { background: var(--accent); color: #0a0b10; border-color: var(--accent); }
        
        .check-btn { width: 100%; padding: 12px; margin-top: 10px; background: linear-gradient(135deg, var(--ok) 0%, #00cc6a 100%); color: #0a0b10; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
        .check-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3); }
        .check-btn:disabled { background: #2a2e38; color: #666; cursor: not-allowed; }
        
        .modal-result { margin-top: 12px; padding: 10px; border-radius: 8px; font-weight: 700; text-align: center; display: none; animation: popIn 0.3s ease; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .modal-result.success { background: rgba(0, 255, 136, 0.1); color: var(--ok); border: 1px solid rgba(0, 255, 136, 0.3); }
        .modal-result.error { background: rgba(255, 51, 85, 0.1); color: var(--err); border: 1px solid rgba(255, 51, 85, 0.3); }

        .close-modal { width: 100%; padding: 12px; margin-top: 1rem; background: rgba(255, 51, 85, 0.1); color: var(--err); border: 1px solid rgba(255, 51, 85, 0.3); border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .close-modal:hover { background: rgba(255, 51, 85, 0.2); }

        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); margin: 2rem 0 1.5rem 0; }
        .tg-button { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px; background: linear-gradient(135deg, var(--tg) 0%, #229ED9 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 1rem; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(42, 171, 238, 0.2); }
        .tg-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(42, 171, 238, 0.4); }
        .tg-button svg { width: 20px; height: 20px; fill: currentColor; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(0, 255, 136, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="nav-tabs">
            <div class="nav-tab active" id="checkerTab" onclick="switchTab('checker')">Проверка</div>
            <div class="nav-tab" id="accountsTab" onclick="switchTab('accounts')">Общие аккаунты</div>
        </div>

        <div id="checkerView" class="view-section active">
            <div class="header">
                <h2>Проверка аккаунта</h2>
                <div class="online-badge"><div class="online-dot"></div><span id="onlineCount">0</span></div>
            </div>
            <div class="input-group"><input type="text" id="username" placeholder="Логин Steam" autocomplete="off"></div>
            <div class="input-group"><input type="password" id="password" placeholder="Пароль"></div>
            <button id="checkBtn" class="action-btn" onclick="checkAccount()">Проверить</button>
            
            <div id="captchaSection">
                <p>Введите код с картинки:</p>
                <img id="captchaImage" src="" alt="CAPTCHA">
                <input type="text" id="captchaText" placeholder="Введите код" style="margin-top: 0;">
                <button class="action-btn" onclick="submitWithCaptcha()" style="margin-top: 10px; background: linear-gradient(135deg, var(--warn) 0%, #e69500 100%);">Отправить с капчей</button>
            </div>
            <div id="result"></div>
        </div>

        <div id="accountsView" class="view-section">
            <div class="header">
                <h2>Общие аккаунты</h2>
            </div>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1rem;">Нажми на игру, чтобы получить данные и проверить</p>
            <div class="accounts-grid" id="accountsGrid"></div>
        </div>

        <div class="divider"></div>
        <a href="https://t.me/MirArenDaff" target="_blank" class="tg-button">
            <svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.319.016.101.017.204.011.285z"/></svg>
            Подпишись (:
        </a>
    </div>

    <div class="modal-overlay" id="accountModal" onclick="if(event.target === this) closeModal()">
        <div class="modal-content">
            <div class="modal-title" id="modalGameTitle">Game Name</div>
            
            <div class="copy-row">
                <label>Логин:</label>
                <input type="text" id="modalLogin" readonly>
                <button class="copy-btn" onclick="copyToClipboard('modalLogin', this)">Копировать</button>
            </div>
            
            <div class="copy-row">
                <label>Пароль:</label>
                <input type="text" id="modalPassword" readonly>
                <button class="copy-btn" onclick="copyToClipboard('modalPassword', this)">Копировать</button>
            </div>

            <button class="check-btn" id="modalCheckBtn" onclick="checkModalAccount()">Проверить аккаунт</button>
            <div id="modalCheckResult" class="modal-result"></div>

            <button class="close-modal" onclick="closeModal()">Закрыть</button>
        </div>
    </div>

    <script>
        function switchTab(tab) {
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
            document.getElementById(tab + 'View').classList.add('active');
            document.getElementById(tab + 'Tab').classList.add('active');
            if (tab === 'accounts') renderAccounts();
        }

        function renderAccounts() {
            const grid = document.getElementById('accountsGrid');
            grid.innerHTML = sharedAccounts.map((acc, index) => \`
                <div class="account-card" onclick="openAccountModal(\${index})">
                    <h3>\${acc.game}</h3>
                </div>
            \`).join('');
        }

        function openAccountModal(index) {
            const acc = sharedAccounts[index];
            document.getElementById('modalGameTitle').textContent = acc.game;
            document.getElementById('modalLogin').value = acc.login;
            document.getElementById('modalPassword').value = acc.password;
            document.getElementById('modalCheckResult').style.display = 'none';
            document.getElementById('modalCheckBtn').disabled = false;
            document.getElementById('modalCheckBtn').textContent = 'Проверить аккаунт';
            document.getElementById('accountModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('accountModal').classList.remove('active');
        }

        function copyToClipboard(elementId, btn) {
            const el = document.getElementById(elementId);
            el.select();
            el.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(el.value).then(() => {
                const originalText = btn.textContent;
                btn.textContent = '✓';
                btn.style.background = 'var(--ok)';
                btn.style.color = '#0a0b10';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 1500);
            });
        }

        async function checkModalAccount() {
            const login = document.getElementById('modalLogin').value;
            const password = document.getElementById('modalPassword').value;
            const btn = document.getElementById('modalCheckBtn');
            const resDiv = document.getElementById('modalCheckResult');
            
            if (!login || !password) return;
            
            btn.disabled = true;
            btn.textContent = 'Проверка...';
            resDiv.style.display = 'none';
            
            try {
                const response = await fetch('/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: login, password: password, captcha_gid: '-1', captcha_text: '' })
                });
                const data = await response.json();
                
                resDiv.style.display = 'block';
                if (data.status === 'success') {
                    resDiv.className = 'modal-result success';
                    resDiv.textContent = 'Аккаунт работает';
                } else {
                    resDiv.className = 'modal-result error';
                    resDiv.textContent = 'Аккаунт не работает';
                }
            } catch (error) {
                resDiv.style.display = 'block';
                resDiv.className = 'modal-result error';
                resDiv.textContent = 'Ошибка соединения';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Проверить аккаунт';
            }
        }

        let currentCaptchaGid = '-1';
        let cooldownTimer = null;
        const COOLDOWN_SECONDS = 15;
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) { sessionId = Math.random().toString(36).substring(2, 15); sessionStorage.setItem('sessionId', sessionId); }

        function pingServer() {
            fetch('/ping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) }).catch(() => {});
        }
        setInterval(pingServer, 10000); pingServer();

        function updateOnlineCount() {
            fetch('/stats').then(r => r.json()).then(data => { document.getElementById('onlineCount').textContent = data.online; }).catch(() => {});
        }
        setInterval(updateOnlineCount, 5000); updateOnlineCount();

        function startCooldown() {
            const btn = document.getElementById('checkBtn');
            let remaining = COOLDOWN_SECONDS;
            btn.disabled = true; btn.textContent = 'Подождите ' + remaining + 'с...';
            if (cooldownTimer) clearInterval(cooldownTimer);
            cooldownTimer = setInterval(() => {
                remaining--;
                if (remaining <= 0) { clearInterval(cooldownTimer); cooldownTimer = null; btn.disabled = false; btn.textContent = 'Проверить'; }
                else { btn.textContent = 'Подождите ' + remaining + 'с...'; }
            }, 1000);
        }

        async function checkAccount() {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const btn = document.getElementById('checkBtn');
            const res = document.getElementById('result');
            
            if (!u || !p) { res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block'; return; }
            
            btn.disabled = true; btn.textContent = 'Проверка...'; res.style.display = 'none';
            document.getElementById('captchaSection').style.display = 'none';
            
            try {
                const response = await fetch('/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p, captcha_gid: '-1', captcha_text: '' })
                });
                const data = await response.json();
                if (data.status === 'captcha') {
                    currentCaptchaGid = data.captcha_gid;
                    document.getElementById('captchaImage').src = '/api/captcha/' + currentCaptchaGid;
                    document.getElementById('captchaSection').style.display = 'block';
                    res.className = 'captcha'; res.textContent = 'Требуется капча'; res.style.display = 'block';
                } else if (data.status === 'success') {
                    res.className = 'success'; res.textContent = 'Аккаунт работает'; res.style.display = 'block';
                } else {
                    res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block';
                }
            } catch (error) {
                res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block';
            } finally { startCooldown(); }
        }

        async function submitWithCaptcha() {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const captchaText = document.getElementById('captchaText').value;
            const btn = document.getElementById('checkBtn');
            const res = document.getElementById('result');
            
            if (!captchaText) { res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block'; return; }
            
            btn.disabled = true; btn.textContent = 'Проверка...'; res.style.display = 'none';
            
            try {
                const response = await fetch('/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p, captcha_gid: currentCaptchaGid, captcha_text: captchaText })
                });
                const data = await response.json();
                if (data.status === 'captcha') {
                    document.getElementById('captchaImage').src = '/api/captcha/' + data.captcha_gid + '?t=' + Date.now();
                    document.getElementById('captchaText').value = '';
                    res.className = 'captcha'; res.textContent = 'Неверная капча, попробуйте снова'; res.style.display = 'block';
                } else if (data.status === 'success') {
                    document.getElementById('captchaSection').style.display = 'none';
                    res.className = 'success'; res.textContent = 'Аккаунт работает'; res.style.display = 'block';
                } else {
                    document.getElementById('captchaSection').style.display = 'none';
                    res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block';
                }
            } catch (error) {
                res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block';
            } finally { startCooldown(); }
        }
    </script>
</body>
</html>
`;

function buildRSAPublicKeyPEM(modHex, expHex) {
    const modBuf = Buffer.from(modHex, 'hex');
    const expBuf = Buffer.from(expHex, 'hex');
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
    return `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
}

async function checkSteamCredentials(username, password, captchaGid = '-1', captchaText = '') {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://steamcommunity.com/login/home/?goto=',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://steamcommunity.com', 'X-Requested-With': 'XMLHttpRequest'
    };

    let rsaData, sessionCookies = '';
    try {
        const rsaResponse = await axios.get('https://steamcommunity.com/login/getrsakey', { params: { username }, headers, timeout: 10000 });
        rsaData = rsaResponse.data;
        if (rsaResponse.headers['set-cookie']) {
            sessionCookies = rsaResponse.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        }
    } catch (error) { return { status: 'error', message: 'Аккаунт не работает' }; }

    if (!rsaData.success) return { status: 'error', message: 'Аккаунт не работает' };

    let encryptedPasswordB64;
    try {
        const publicKeyPem = buildRSAPublicKeyPEM(rsaData.publickey_mod, rsaData.publickey_exp);
        const encrypted = crypto.publicEncrypt({ key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(password, 'utf-8'));
        encryptedPasswordB64 = encrypted.toString('base64');
    } catch (error) { return { status: 'error', message: 'Аккаунт не работает' }; }

    const payload = new URLSearchParams({
        username, password: encryptedPasswordB64, twofactorcode: '', emailauth: '', loginfriendlyname: '',
        captchagid: captchaGid, captcha_text: captchaText, emailsteamid: '', rsatimestamp: rsaData.timestamp,
        remember_login: 'false', donotcache: Date.now().toString()
    });

    const loginHeaders = { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' };
    if (sessionCookies) loginHeaders['Cookie'] = sessionCookies;

    let loginData;
    try {
        const loginResponse = await axios.post('https://steamcommunity.com/login/dologin/', payload.toString(), { headers: loginHeaders, timeout: 10000 });
        loginData = loginResponse.data;
    } catch (error) { return { status: 'error', message: 'Аккаунт не работает' }; }

    if (loginData.success) return { status: 'success', message: 'Аккаунт работает' };
    if (loginData.captcha_needed) {
        return { status: 'captcha', message: 'Требуется капча', captcha_gid: loginData.captcha_gid || '-1' };
    }
    return { status: 'error', message: 'Аккаунт не работает' };
}

app.get('/', (req, res) => res.send(HTML_TEMPLATE));

app.get('/api/captcha/:gid', async (req, res) => {
    try {
        const response = await axios.get(`https://steamcommunity.com/login/rendercaptcha/?gid=${req.params.gid}`, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 10000
        });
        res.set('Content-Type', 'image/jpeg');
        res.send(response.data);
    } catch (e) {
        res.status(500).send('Ошибка загрузки капчи');
    }
});

app.post('/ping', (req, res) => {
    if (req.body.sessionId) activeSessions.set(req.body.sessionId, Date.now());
    res.json({ ok: true });
});

app.get('/stats', (req, res) => res.json({ online: activeSessions.size }));

app.post('/check', async (req, res) => {
    const { username, password, captcha_gid, captcha_text } = req.body;
    if (!username || !password) return res.json({ status: 'error', message: 'Аккаунт не работает' });
    const result = await checkSteamCredentials(username.trim(), password.trim(), captcha_gid || '-1', captcha_text || '');
    res.json(result);
});

app.listen(PORT, '0.0.0.0', () => console.log(`Сервер запущен на порту ${PORT}`));
