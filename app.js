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
    { game: "BeamNG.drive", login: "beamngdrive123steam1", password: "Kte!22ijaAII12" },
    { game: "Kingdom Come Deliverance 2", login: "mosgq70379", password: "oeldf55726" },
    { game: "UNCHARTED: Legacy of Thieves", login: "uncharted_st", password: "UNCHARTED@8804" },
    { game: "Forza Horizon 4, ARK, LEGO Batman", login: "nmsukt191", password: "batzaza191" },
    { game: "Black Myth Wukong", login: "gfk66337", password: "Acp234213" },
    { game: "GTA 5, RE 2, RE 3, Witcher 3", login: "0855j9", password: "zZ10301030" },
    { game: "Marvel's Spider-Man 2", login: "groggymovement4", password: "DCN_LliOQhv" },
    { game: "Red Dead Redemption 2", login: "ynysa422", password: "@Gamerspace123" },
    { game: "NBA 2K20, GTA SA, GTA 5", login: "rnmiike", password: "THEGODMIKE1" },
    { game: "Marvel's Spider-Man Remastered", login: "mklvn2y9", password: "zhizhure1221" },
    { game: "TLOU 2, TLOU 1, RE 2, 3, 4", login: "STEAMGAMESTT1", password: "funpay.com/users/6932278/" },
    { game: "Hogwarts Legacy", login: "nicasacracacenri", password: "EBA9Y59KGCTB" },
    { game: "Resident Evil 7", login: "jocuriargenrinia", password: "70Games.net92" },
    { game: "Grand Theft Auto 4", login: "wqm322495", password: "ac7QPfa3" },
    { game: "Horizon Forbidden West", login: "vonterr", password: "889162" },
    { game: "Cyberpunk 2077", login: "orderlyinoculat", password: "axQUk8etMajK" },
    { game: "Dying Light 2, Sons of Forest", login: "earthlnwza5566", password: "2G6TEM5ZAZC6" },
    { game: "Euro Truck Simulator 2", login: "nfpprsq3h", password: "f1qslg5kp" },
    { game: "Atomic Heart", login: "wf6ju3bf5wc3", password: "qKnh6N9SLiMxyvXVX36d" },
    { game: "Forza Horizon 5", login: "bej01201", password: "Bejdw11201" },
    { game: "CoD MW2, PES 2021", login: "dimkoxd", password: "2G6TEM5ZAZC6" },
    { game: "Mortal Kombat 11, ETS 2", login: "steam123z17", password: "ZXCVBNMQQ" },
    { game: "Mortal Kombat 1", login: "Mortalk1pehkflt01", password: "TGVBFRETt01" },
    { game: "Farming Simulator 25", login: "neylavewe1985", password: "wFbmEcKQ" },
    { game: "Metro, Sons of Forest, Witcher 3", login: "negri_pidor1488", password: "fjbjnoDEFSjkndfgzhjkoCDSA09" },
    { game: "FIFA 22", login: "xxyenlover", password: "34cv56BN" },
    { game: "Terraria, Baldi's Basics", login: "quincypugy", password: "0Heh%v4SSG" },
    { game: "Hearts of Iron 4, Batman AA", login: "meteprotr", password: "3D88ASX2AMCG" },
    { game: "Witcher 3, ARK Survival", login: "thnavud1", password: "0641769856Za" },
    { game: "CoD MW 2019, Spider-Man, Far Cry 3", login: "soham123419", password: "Funpay-0nibist" },
    { game: "The Forest, Outlast 2", login: "hhied98481", password: "Deaiwoq217" },
    { game: "Detroit: Become Human", login: "Detroit_st", password: "DETROIT@7401" },
    { game: "Resident Evil 4 Remake", login: "bejdw24074", password: "steamkk.com" },
    { game: "Dying Light, ETS 2, L4D2", login: "YaKrycheVasFP", password: "VM@KLGT8W34C" },
    { game: "Forza Horizon 5 + DLC", login: "pq3sz8ar9rx8", password: "SZ7ZF8YSFCXE" },
    { game: "CoD Black Ops 3", login: "xbeverysketch", password: "st3@mxx645" },
    { game: "FIFA 21, FIFA 22", login: "rd5977", password: "951753852.ACHU" },
    { game: "Days Gone, FC 24, GTA 5", login: "juscelinolira", password: "CDTBTD66XEX6" },
    { game: "Sons of Forest, Schedule, R.E.P.O", login: "SDACHAvARENDY01", password: "$j2si2jLDSJFJ2Nsj" },
    { game: "Elden Ring, Witcher 3", login: "shushi_elden_ring", password: "Owner_shushiGames_Seller" },
    { game: "RDR 2, Witcher 3", login: "red_dead_profix", password: "DASjsaj72ow8" },
    { game: "CoD MW3, GTA 4, CoD MW2", login: "sunzshiine", password: "msmb1122" },
    { game: "CoD WW2", login: "pandagame4418", password: "cod1452141" },
    { game: "Silent Hill 2", login: "aboodack", password: "DC5Z25E465DX" },
    { game: "Battlefield 5, ARK", login: "zhangben6662", password: "BNKGTsnMWu" },
    { game: "Metro Exodus, Cyberpunk 2077", login: "cyberhitler1488", password: "Bbuv837FSgnB2" },
    { game: "Ghost of Tsushima", login: "gihmt99337", password: "my_funpay_dtgame" },
    { game: "Black Myth Wukong", login: "mario_wukong", password: "QCP7PFHMW4VV" },
    { game: "Assetto Corsa, ETS 2, City Car", login: "ShezyyyFunPay", password: "funpay.com/users/8943271/" },
    { game: "Metro Exodus + many games", login: "opgarpstore1", password: "safEA24O-" },
    { game: "Spider-Man MM, Hello Neighbor", login: "polszymek123", password: "Funpay-Onibist1" },
    { game: "Mafia 2 DE, Skyrim", login: "hazer3", password: "S2477TT27EC6" },
    { game: "NBA 2K22", login: "Shixize1", password: "PwxcoNGgFM" },
    { game: "Mafia Trilogy", login: "sss0614", password: "Mafia$75" },
    { game: "BeamNG.drive", login: "mbig4912", password: "Eb2PLbZ3" },
    { game: "Sekiro", login: "05796591", password: "Derkyt111666" },
    { game: "Hogwarts, Ghost of Tsushima", login: "nrbon69177", password: "meisonlyme1A" },
    { game: "DayZ", login: "amlv63032", password: "CExXMoJXF1TU" },
    { game: "God of War, Tomb Raider", login: "mayli1001", password: "MqPN05kcpk89" },
    { game: "Kingdom Come 2", login: "phvmg47604", password: "bfmjj99570" },
    { game: "DOOM: The Dark Ages", login: "fdsfdsfds9824", password: "x2jrrd7mef3jqSX" },
    { game: "God of War Ragnarok", login: "dart1997", password: "YXJYS80P7164" },
    { game: "Clair Obscur Expedition 33", login: "dgb236444", password: "tjjn248562" },
    { game: "The Last of Us Remastered", login: "hiyondw615", password: "sp9wyq8s" },
    { game: "LEGO Harry Potter, Elden Ring", login: "Thragg_767", password: "ev8Z5YyvY42RmiX" },
    { game: "Cyberpunk 2077", login: "mardiprawdziwy", password: "G4market999" },
    { game: "Spider-Man Remastered, MM", login: "NEW2SPIDERSMANOFF581", password: "jMc3rP#=lBu{43fz{-v" },
    { game: "GTA 5, Rust, Among Us", login: "RsgKingz", password: "Deshawn2010$" },
    { game: "GTA VC, Hitman 2, Fallout 3", login: "ihhza24z", password: "4ytb9naa" },
    { game: "Black Myth Wukong", login: "8782146147", password: "Derkytt090934" },
    { game: "Forza Horizon 5", login: "wbtq1089352", password: "steamok778899" },
    { game: "STALKER Shadow of Chornobyl", login: "74gub9322di6", password: "tjjn248562" },
    { game: "Silent Hill 2 Remake", login: "xd7e5b", password: "djCZiNsY" },
    { game: "Cyberpunk 2077, Metro, Mafia", login: "necros13579", password: "13579zef" },
    { game: "Forza Horizon 4", login: "pf7yq3uu8ry9", password: "Tu2Ww3Uk1Ok6" },
    { game: "60 Seconds! Reatomized", login: "ghuzn91928", password: "PexhPCWAW4" },
    { game: "GTA 5, FH5, Assetto Corsa", login: "uihgee2505", password: "g1r506wh1a56wehr106" },
    { game: "Cuphead", login: "su0wn1hf", password: "UOipTT58vG5XZ1" },
    { game: "Elden Ring Nightreign", login: "gaonengDW77703", password: "05698748" },
    { game: "TLOU 2 Remastered", login: "k8ef0k53f", password: "RaysShopAkk!2" },
    { game: "Hello Neighbor", login: "markoparada2011", password: "5https://t.me/steamiq" },
    { game: "NBA 2K25", login: "kk80401", password: "kk223344kkwdw" },
    { game: "Far Cry 5, FIFA 22, Far Cry 3", login: "paraguaapeek", password: "2deenerodel2003" },
    { game: "Don't Starve, BM:W, FH4", login: "34095617", password: "YDMBXMK7EK3K" },
    { game: "Crysis 3 Remastered", login: "fpfuryfamily", password: "thxfp362" },
    { game: "God of War Ragnarok", login: "cretosesat1971", password: "JYQaFwd7zh" },
    { game: "Ghost of Tsushima, DL The Beast", login: "moguchichlen228", password: "JBVAo_432fe1f" },
    { game: "FH4, Cyberpunk 2077", login: "fk1xo6tz8bt7", password: "cTiAP4Jh3xfW" },
    { game: "Dead Island 2, Dying Light", login: "fpsquimeeminon1", password: "funpaysquimeeminon2" },
    { game: "Resident Evil Requiem", login: "ffpsw21350", password: "funpaytop_33" },
    { game: "Rain World", login: "steamok100893", password: "steamok100885" },
    { game: "Resident Evil Requiem", login: "genpestovy6nh41", password: "siski3623HHfkFaAz264" },
    { game: "God of War Ragnarok", login: "ragnarok_byheero", password: "https://t.me/steamaccountsog" },
    { game: "Terraria", login: "04c4ifka", password: "marpanov" },
    { game: "Hello Neighbor 2", login: "mylann_flashh", password: "31https://t.me/steamiq" },
    { game: "STALKER 2", login: "statalalal1971", password: "8ia1uejk" },
    { game: "Resident Evil 4 Remake", login: "iinnjj4759", password: "3dE6wjsplay" },
    { game: "Little Nightmares", login: "adlyangel2", password: "a1b9c3wq" },
    { game: "TLOU Remastered", login: "pakinta", password: "www.pokopow.com" },
    { game: "SnowRunner", login: "dedqs21651", password: "FrZ78mgY" },
    { game: "CoD MW2", login: "bababagob555", password: "027535503" },
    { game: "Borderlands 1", login: "220788844", password: "046741243" },
    { game: "Outlast Trials", login: "wered171", password: "https://funpay.com/users/13462512/" },
    { game: "GTA San Andreas", login: "joelal123", password: "Bigboss007@" },
    { game: "MudRunner", login: "yuchen3024", password: "zhengdacong01" },
    { game: "RE, Metro, DOOM, Witcher, Skyrim", login: "gagagugu1254", password: "polpolpol09" },
    { game: "Red Dead Redemption 2", login: "miro97790405", password: "marpanov_free20" },
    { game: "Besiege", login: "offl1neman", password: "P@1dbyMan" },
    { game: "Valheim, City Car, Hitman 2", login: "crew_utpiaplay24", password: "Gogbokonch!78" },
    { game: "Granny Remake", login: "kewbt36891", password: "FunPaySAPOZNIK" },
    { game: "MX Bikes", login: "xbglp85313", password: "cnkf64372Y" },
    { game: "Hogwarts Legacy", login: "hros1kshopp", password: "Hros1kShop!1" },
    { game: "Battlefield 4 Premium", login: "xxd3m3nt0rxx", password: "3158752610E" },
    { game: "Resident Evil Requiem", login: "Gf5sa4241", password: "1https://funpay.com/users/14002680/" },
    { game: "Call of Duty Series", login: "stillyn", password: "Asdzxc1234)))))" },
    { game: "CoD Infinite Warfare", login: "maxiek_d", password: "ZZZZZrr1310" },
    { game: "Resident Evil 4", login: "blue_magician_", password: "B2A2ZC656T3M" },
    { game: "MS Flight Simulator 2024", login: "antonioralph1972ff", password: "0Oe!brsaxqsn2206" },
    { game: "Ghost of Tsushima", login: "pakinta", password: "www.pokopow.com" },
    { game: "Dying Light The Beast", login: "ejhd2464", password: "gnww246422" },
    { game: "Gas Station Simulator", login: "gbd_dev", password: "GO2Apple2022" },
    { game: "Metro Series + DLC", login: "GluttonyMorica312", password: "EFUldfejirlwyu649odj" },
    { game: "Mortal Kombat + Tekken", login: "wsgln795693", password: "7LERANDR@BAW!@" },
    { game: "Squad", login: "izyd_", password: "zeyd14jst" },
    { game: "Mafia 2 + DE", login: "dinobozz1", password: "ZI5XqvhDMhpOhaQRfgQCo" },
    { game: "Spider-Man Remastered + MM", login: "johnlopez217", password: "funpayChainz96" },
    { game: "Skyrim, Witcher 3", login: "gagagugu1254", password: "polpolpol09" },
    { game: "Wallpaper Engine", login: "ruiiixx", password: "S67GBTB83D3Y" },
    { game: "God of War Ragnarok", login: "qavix221", password: "playerok.com/profile/QAVIX" },
    { game: "Escape the Backrooms", login: "offl1neman", password: "P@1dbyMan" },
    { game: "R.E.P.O + Terraria", login: "attrth11", password: "zxc333Yaa" },
    { game: "Half-Life 1/2, Postal 1/2", login: "wered171", password: "https://funpay.com/users/13462512/" },
    { game: "Poppy Playtime (All)", login: "poppyxiajsh", password: "playerok.com/profile/QAVIX" },
    { game: "MS Flight Simulator 2020", login: "Dovyrth", password: "Nzkahdn97" },
    { game: "Friday the 13th", login: "xwk1998", password: "senha2019" },
    { game: "Assetto Corsa", login: "wbtq1085833", password: "steamok222111" },
    { game: "Cyberpunk 2077", login: "pp29icpg", password: "RRayane66" },
    { game: "Sunkenland", login: "swcmzd", password: "Sw758982" },
    { game: "Accident", login: "mastergamer9901", password: "supergamerscp" },
    { game: "Farming Simulator 22", login: "aurelie_8283", password: "8DDE8XKS8GSK" },
    { game: "CoD Black Ops 3 + games", login: "john_bubbles666", password: "Slipperfeet55" },
    { game: "Fallout Series", login: "folomon55x", password: "kolobok44884" },
    { game: "Far Cry 3-6, Metro", login: "pfzpy98380", password: "Wjuyk63519-" },
    { game: "GTA 5 Premium", login: "doona242", password: "CandyShell" },
    { game: "GTA San Andreas", login: "joelal123", password: "Bigboss007@" },
    { game: "CoD MW3 (2023)", login: "lady_jess1", password: "27https://t.me/steamiq" },
    { game: "Accident: The Pilot", login: "onsrk052", password: "chengyu456565" },
    { game: "TLOU 2, Stellar Blade, WUCHANG", login: "mutnr91844", password: "dolus86-FunPAy" },
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
    { game: "Tekken 7 + BF1", login: "zacsef132", password: "2cool4school@" },
    { game: "Stray", login: "pmrh73716", password: "chengyu2444477" },
    { game: "Mafia DE + Library", login: "Lkuyg12", password: "17789567Qjsu1" },
    { game: "Resident Evil Requiem", login: "caigamer_cn_re9_2", password: "caiGamer.cn" },
    { game: "Baldur's Gate 3", login: "shareourlives5", password: "share_our_lives." },
    { game: "FNAF Security Breach", login: "fernando3578546", password: "fer20082021" },
    { game: "Schedule I", login: "fifj10864", password: "Rogerard7676" },
    { game: "Subnautica 1-2", login: "hfsdfz", password: "xvdgfghfh" },
    { game: "Dying Light The Beast", login: "ejhd2464", password: "gnww246422" },
    { game: "My Summer Car", login: "ShezyyyFunPay", password: "funpay.com/users/8943271/" },
    { game: "Spider-Man Miles Morales", login: "cnykqx48s", password: "Progamer@" },
    { game: "DOOM Eternal + Library", login: "porlik567", password: "q3ergiuhK_41" },
    { game: "Mafia 2 DE + Classic", login: "dinobozz1", password: "ZI5XqvhDMhpOhaQRfgQCo" },
    { game: "Jurassic World Evolution 2", login: "danny_cjo", password: "995658364Dcjo" },
    { game: "Mafia: The Old Country", login: "mkhh0693", password: "wxsr4347" },
    { game: "Batman AC + AA", login: "hongchen8821", password: "hongchen11523" },
    { game: "Marvel's Spider-Man 2", login: "sumptuoustypolo2", password: "ZZZZZrr132" },
    { game: "WH40K Space Marine 2", login: "nszbi26074", password: "exwgp64749" },
    { game: "Factorio", login: "precisedisadvan", password: "Nocker76*" },
    { game: "Resident Evil Requiem", login: "Porlik567", password: "q3ergiuhK_41" },
    { game: "Payday 2", login: "brurocker", password: "bruno123" },
    { game: "Guardians of the Galaxy", login: "ni9rvz0j", password: "chengyu445567" },
    { game: "Sekiro", login: "by_heero", password: "https://t.me/steamaccountsog" },
    { game: "Supermarket Simulator", login: "roeor86081", password: "eowz52837B" },
    { game: "Mafia 3", login: "jumala_is_back", password: "9XZtDnzmp0Ms" },
    { game: "Little Nightmares 3", login: "dbqwd83332", password: "kvjvo89167" },
    { game: "Reanimal", login: "ath775292", password: "UtE670214" },
    { game: "Buckshot Roulette", login: "bagshototmonstra", password: "INngvjieb3423@" },
    { game: "Hitman 2", login: "bas_suurland@hotmail.com", password: "u4r9omZo2MW3L4J" },
    { game: "Firefighting Simulator", login: "qnlrs88225", password: "Kukimaki18" },
    { game: "BM:W + Clair Obscur", login: "bando_loves_boobs", password: "fpcandyshell123" },
    { game: "Naruto UNS 4", login: "tanwakon", password: "30https://t.me/steamiq" },
    { game: "Mount & Blade 2", login: "qimayukanha22", password: "faffasf4554" },
    { game: "CoD MW3 (2023)", login: "Iu8Yr7Gp5Oh6", password: "Ji6Nm2Fb7Bb3" },
    { game: "Hitman Absolution", login: "gggggggfsafdsa", password: "marpanov_free7" },
    { game: "People Playground", login: "steamok1090206", password: "steamok888777" },
    { game: "Metro 2033", login: "magepll", password: "marpanov_free16" },
    { game: "BeamNG.drive", login: "Ht7Zq6Ed8Ga1", password: "Tl0Jy8Gl9Fq5" },
    { game: "F1 2024", login: "igoa10919", password: "30https://t.me/steamiq" },
    { game: "Clair Obscur Expedition 33", login: "seventy_qroqobgf", password: "70xplay.com" },
    { game: "CoD WW2 + Library", login: "arks62", password: "playerokTovarStoreRe" },
    { game: "Crimson Desert Deluxe", login: "ehtkd33230", password: "vohhe98963" },
    { game: "Schedule I", login: "fifj10864", password: "Rogerard7676" },
    { game: "BeamNG Drive", login: "ynhtvAede2vynh", password: "siski339cwU0Q5H3wWWRvb" },
    { game: "Cyberpunk 2077 + Library", login: "vzooy75082", password: "auodt55959" },
    { game: "Dying Light The Beast", login: "ecvgz63808", password: "xeujn89038" },
    { game: "Uncharted 4: Legacy", login: "pokopowadventure", password: "www.pokopow.com#8392" },
    { game: "CoD MW2 (2022)", login: "uj5j45311", password: "FElvc5204" },
    { game: "The Crew Motorfest", login: "mqlfylzyhb@rambler.ru", password: "Mx2023!!9" },
    { game: "Postal 4", login: "lycnk701", password: "steamok0606" },
    { game: "MS Fly Sim + XPlane", login: "21flying", password: "Z2AKDCM3M6GZ" },
    { game: "Dying Light 2 + Library", login: "thedrbld", password: "acc561209" },
    { game: "Metro Exodus + EE", login: "ivpopov13", password: "BQDhvkGfAPYh4Voqd8aco" },
    { game: "BeamNG.drive", login: "beamngfpaccusedd", password: "Funpayaccusedd." },
    { game: "Batman AK + Raft", login: "furkaneepro", password: "Ascarletawd3434" },
    { game: "Mafia Trilogy", login: "enova36601", password: "aynhs76029" },
    { game: "WWE 2K20", login: "xrikm135", password: "steamok003004" },
    { game: "Sleeping Dogs DE", login: "H7_is410365", password: "22https://t.me/steamiq" },
    { game: "God of War Ragnarok", login: "gowranarokbggz7", password: "Bggz7770302#" },
    { game: "Metro 2033 Redux", login: "muxj5accmp", password: "Georgian326fg" },
    { game: "Atomic Heart", login: "wvpmf30392", password: "4213qmUuZjf2" },
    { game: "CoD MW2 (2009)", login: "bababagob555", password: "027535503" },
    { game: "RE4 Remake + Library", login: "rivalchik52", password: "VADIMCHIK228" },
    { game: "God of War Ragnarok", login: "xyjba80543", password: "god511300" },
    { game: "Bodycam", login: "4ttbs8lh", password: "https://funpay.com/users/18318680/" },
    { game: "BeamNG.drive", login: "beamngfpaccusedd", password: "Funpayaccusedd." },
    { game: "Spider-Man Remastered", login: "rivalchik52", password: "VADIMCHIK228" },
    { game: "Cyberpunk 2077", login: "zttsl29092", password: "chjv42725G" },
    { game: "PRAGMATA", login: "Puzir8081", password: "Hx@836RvMa95E" },
    { game: "Black Myth Wukong", login: "tronghp1234", password: "Tronghp1232334@" },
    { game: "Days Gone + Library", login: "Qx9Tk9Nx0Ca1", password: "Pm0Ta0Zh8Wa5" },
    { game: "STALKER 2", login: "xvdgfghfh", password: "aojjr17797" },
    { game: "Crimson Desert", login: "oiato98547", password: "wvlyn58167" },
    { game: "Left 4 Dead 2", login: "skibiditopfunpayofflineaccaynt", password: "Safs@42352jkkdfsuefdsjeh@hu!ihsd" },
    { game: "Forza Horizon 5", login: "flusstim28893", password: "https://funpay.com/users/6442502/" },
    { game: "Pragmata", login: "cycxr66898", password: "Nekt0inoy" },
    { game: "Metro Series", login: "frwzx76017", password: "https://funpay.com/users/16100391/" },
    { game: "ARC Raiders", login: "uzes79494", password: "Georgian326fg!" },
    { game: "Forza Horizon 5", login: "ux3zc4zm5ed5", password: "miraque0*" },
    { game: "Hello Neighbor + Library", login: "pucyhxul1809", password: "GGSEL_CopperS" },
    { game: "Horizon Forbidden West", login: "ForbiiiddenWest", password: "Forbidden2$4567" },
    { game: "Subnautica 2 + Library", login: "umuyd62770", password: "pmo090710" },
    { game: "Stardew Valley", login: "qq280890801", password: "Qq921225" },
    { game: "Brick Rigs", login: "brianrobinson8z", password: "vsnsuswmbo" },
    { game: "Universe Sandbox", login: "ifiqg350", password: "steamok45245235" },
    { game: "WorldBox", login: "ruhpz331", password: "xicxe352" },
    { game: "Mortal Kombat 11", login: "rivalchik52", password: "VADIMCHIK228" },
    { game: "Forza Horizon 6", login: "ebyvh18205", password: "azxak61276" },
    { game: "Hello Neighbor 2", login: "mylann_flashh", password: "31https://t.me/steamiq" },
    { game: "Hearts of Iron 4", login: "Gotfaunt", password: "L9TBc10eS1Im7di" },
    { game: "Saints Row 3 Remastered", login: "steamok1090064", password: "steamok200" },
    { game: "Subnautica 2", login: "yawmo27399", password: "krucv57682" },
    { game: "Forza Horizon 6", login: "aprjq68036", password: "Nekt0fpFH6" },
    { game: "Ghost Recon Breakpoint", login: "hcvrm82378", password: "%chri1218%" },
    { game: "Subnautica 2", login: "tjbqo31217", password: "uybwx2853832A" },
    { game: "Wallpaper Engine", login: "hqcw83331", password: "ivovasilis6456" },
    { game: "Forza Horizon 6", login: "nwcnnGP43", password: "funpay-fr1zzq" },
    { game: "007 First Light", login: "ujm701041", password: "TlI909452" },
    { game: "Many Games", login: "laszlovoros60", password: "pazalyhozo4688" },
    { game: "RE Requiem + Library", login: "ricciganggame", password: "https://funpay.com/users/5644459/" },
    { game: "Ready or Not", login: "ydic63676", password: "HouseReady1@" },
    { game: "TLOU Part 2", login: "madishare11111", password: "79cBeTCpEZjABC_" },
    { game: "Riders Republic", login: "58786917", password: "25925863" },
    { game: "007 First Light", login: "Juj22485", password: "sf757376" },
    { game: "Uncharted Legacy", login: "fogmool", password: "Nutersonk43!" },
    { game: "Escape the Backrooms", login: "kmkaw84460", password: "33https://t.me/steamiq" },
    { game: "CoD MW 2019", login: "financialscorpion39551", password: "n40saxt50yiyn4g!zru3b" },
    { game: "STALKER 2", login: "statalalal1971", password: "8ia1uejk" },
    { game: "God of War Ragnarok", login: "ragnarok_byheero", password: "https://t.me/steamaccountsog" },
    { game: "Mon Bazou", login: "selfishsturgeon4899", password: "Sully!?09" },
    { game: "Farming Simulator 22", login: "aurelie_8283", password: "8DDE8XKS8GSK" },
    { game: "Mecha Chameleon", login: "klimflain234", password: "crTf(T%yY'sN-62" },
    { game: "Many Games", login: "overfreak911", password: "yachertila" },
    { game: "Arma 3 + Library", login: "berk1158", password: "arifkaya2007" },
    { game: "Farming Simulator 25", login: "yromadev1", password: "xDvTSb37UyBRsY" },
    { game: "Red Dead Redemption 2", login: "presidentialbandicoot8056", password: "f-r-e-e-akk-tg:@hyznet" },
    { game: "All CoD Games", login: "march_2103", password: "x_plays111" },
    { game: "Subnautica", login: "6raymone23", password: "BilyjDeqqC" },
    { game: "CoD MW3 (2023)", login: "mmzjlo8x", password: "glIIsTNozyiu" },
    { game: "PES 2019, PES 2016", login: "pes2019pes", password: "Pe$$ep97!" },
    { game: "Crysis 3 Remastered", login: "frwzx76017", password: "https://funpay.com/users/16100391/" },
    { game: "Elden Ring", login: "rpatt27237", password: "funpayfeatherqElden" },
    { game: "Arma Reforger", login: "hollygordon1961", password: "acbc42b6247a41c7bfa3e88bb3e81e9b" },
    { game: "Human Fall Flat", login: "1353358044", password: "wangshiyao123" },
    { game: "Dead by Daylight", login: "zaydd73995", password: "xvtzn66391" },
    { game: "Dying Light 2", login: "xdrmw05622", password: "cwbme10188" },
    { game: "BeamNG + Teardown", login: "tgasb88565", password: "Ffe93Gefr" },
    { game: "NFS Unbound", login: "kagqg46840", password: "igik8626" },
    { game: "Dark Souls Remastered", login: "bot22_2", password: "bot222RT" },
    { game: "NFS Heat", login: "yghf42788", password: "Progamer@" },
    { game: "Mafia: The Old Country", login: "mafia_phasmavpn", password: "qWERTY33!" },
    { game: "Mafia 2 + DE", login: "enova36601", password: "aynhs76029" },
    { game: "Euro Truck Simulator 2", login: "lc4tk0bn9fs5", password: "Polopolo9" },
    { game: "Project Zomboid", login: "wn61CUFy", password: "ng20QBGP" },
    { game: "Skyrim", login: "jadalilgarcia", password: "sk8erboi8" },
    { game: "Just Cause 3", login: "m0rfisftw", password: "6619264692Morfis" },
    { game: "TLOU 1 + 2 Remastered", login: "thelast1q", password: "playerok.com/profile/QAVIX" },
    { game: "City Car Driving", login: "moteenhoiki", password: "Dj3JOO3fjRVtR67" },
    { game: "Split Fiction", login: "kauoy17421", password: "esqa74870W" },
    { game: "No Man's Sky", login: "wbtq1085903", password: "steamok35664Y" },
    { game: "CoD Series", login: "stillyn", password: "Asdzxc1234)))))" },
    { game: "Ready or Not", login: "mj09uq5kw", password: "KKg0xvKyzVNs6y" },
    { game: "CoD MW 2019, Skate", login: "financialscorpion39551", password: "n40saxt50yiyn4g!zru3b" },
    { game: "HZD, Cyberpunk, Drift", login: "alridergans1985", password: "qJgS2p5PEL1992" },
    { game: "HK Silksong, RE Requiem", login: "ricciganggame", password: "https://funpay.com/users/5644459/" },
    { game: "FIFA 22, ARK", login: "marianalvarezzz1992", password: "Yanier1992" },
    { game: "Hogwarts, WRC 7, WRC 5", login: "zon_jb", password: "Tomteland98" },
    { game: "MK X, MK11, Detroit, RE", login: "neffffffffex", password: "https://funpay.com/users/17414395/" },
    { game: "RE2 Remake", login: "shenghuaweiji2a", password: "Hh6039512a" },
    { game: "God of War 2018", login: "oiydz866", password: "chengyu456778" },
    { game: "CoD Vanguard, Hello N", login: "tozinabro1977", password: "2CH4bGOe6S1978" },
    { game: "FIFA 23, ETS 2, PES 2016", login: "coranhart", password: "H9mqE6og31" },
    { game: "Grid 2, BeamNG, MK11", login: "ba1aq2qp1fq4", password: "Gf9Jr5Oh1Ek9" },
    { game: "Mortal Kombat 11", login: "mortalkombat11sharing", password: "mortalkombat112019" },
    { game: "SnowRunner, L4D2, Rust", login: "lsoiy210", password: "lwl67033R" },
    { game: "MudRunner, Cities, L4D2", login: "tczfy83308", password: "HE1092618" },
    { game: "Arma 2, L4D2", login: "supersuper61", password: "coelho2015" },
    { game: "CoD MW2 (2022)", login: "uexq59805", password: "jjackson14" },
    { game: "007, FH6, LEGO Batman", login: "bcaxo55681", password: "noyyb36531" },
    { game: "NBA 2K26, Skate", login: "ofyxw04053", password: "uixay83374" },
    { game: "Mecha Chameleon", login: "ydtdo32097", password: "PzIf3P1GXw2dEJ" },
    { game: "GTA SA, GTA 5, ETS 2", login: "joelal123", password: "Bigboss007@" },
    { game: "R.E.P.O", login: "anthonykelly1972", password: "TovarStore123" },
    { game: "The Forest, Among Us", login: "wbtq1083464", password: "steamok45785112" },
    { game: "Cyberpunk, Mafia, TLOU", login: "toto121aktiva", password: "afkaweo9312jfia0" },
    { game: "CoD MW 2019", login: "financialscorpion39551", password: "n40saxt50yiyn4g!zru3b" },
    { game: "MK 1, MK11, MK X", login: "SkizeGames13801MK1", password: "www.skizegames.store" },
    { game: "Bodycam, DBD, DI2", login: "s6242xmx", password: "IZNnSgUjrbdK" },
    { game: "Horizon Zero Dawn", login: "jollyrojer919", password: "offlineactivator919" },
    { game: "Resident Evil Requiem", login: "dedqs21651", password: "FrZ78mgY" },
    { game: "FS19, ETS 2", login: "zazaxe4", password: "37191610z" },
    { game: "GTA 5 Enhanced/Legacy", login: "kostagjorcepetrov", password: "marpanov_free15" },
    { game: "Trailmakers", login: "steamok1089916", password: "steamok765567" },
    { game: "FS17, Spintires", login: "stimgamerfarmingsymulator2017", password: "steamgamer321fs!2017" },
    { game: "Binding of Isaac", login: "wbtq1086053", password: "steamok987789" },
    { game: "Sniper Elite 5, 4", login: "ooSniperDeluxeoo", password: "DEL9OElite8Sniper9" },
    { game: "FNAF Secret of Mimic", login: "fredglover1960", password: "nqszzger9229$!1v0" },
    { game: "NBA 2K26", login: "Ds2Im2Nk3Gy2", password: "Ud9Mw0Mo7Iu7" },
    { game: "Rust", login: "zgejcplxny", password: "tvzE3igz2A" },
    { game: "FIFA 22", login: "marianalvarezzz1992", password: "Yanier1992" },
    { game: "Forza Horizon 5", login: "funnymassivepony08", password: "Roundkick991XME342" },
    { game: "Five Nights at Freddy's", login: "zuopy28956", password: "elib56353E" },
    { game: "GTA 5 Legacy/Enhanced", login: "wecd820201", password: "dddQIK2Yb" },
    { game: "Death Stranding 2", login: "wgum29vkmrnjv", password: "raRN9AGCUPljKdlSL4" },
    { game: "Uncharted Legacy", login: "ao0na8xp5yp2", password: "Mn6Ld9Ex1Fr8" },
    { game: "STALKER 2", login: "zalobechi1983", password: "NJLZ4LWNTY1989" },
    { game: "Stray", login: "pmrh73716", password: "chengyu2444477" },
    { game: "Far Cry 1-6", login: "farcryxiajsh", password: "playerok.com/profile/QAVIX" },
    { game: "Construction Simulator", login: "probunloti1982", password: "an41526kx" },
    { game: "BeamNG.drive", login: "Ht7Zq6Ed8Ga1", password: "Tl0Jy8Gl9Fq5" },
    { game: "Hello Neighbor 2, Miside", login: "Direp12", password: "112314533Q" },
    { game: "Ghost, Far Cry 6, CoD", login: "sfsefawd", password: "sef435$%#" },
    { game: "God of War (2018)", login: "oiydz866", password: "chengyu456778" },
    { game: "Subnautica 2", login: "codl39195", password: "Pt5Ac2Fu8Yf66t" },
    { game: "Assetto Corsa", login: "babai0_02", password: "Kasra.0919" },
    { game: "LEGO Marvel Super Heroes", login: "twistnewold", password: "5sMgwST4L5j" }
];

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Steam Tools</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#050508;
  --surface:rgba(12,12,18,0.6);
  --surface-2:rgba(18,18,26,0.8);
  --border:rgba(255,255,255,0.06);
  --text:#e8e8f0;
  --text-dim:#6b6b7d;
  --accent:#00d4ff;
  --accent-glow:rgba(0,212,255,0.4);
  --ok:#00ff9d;
  --err:#ff3366;
  --warn:#ffb800;
  --tg:#2AABEE;
}
html,body{background:var(--bg);color:var(--text);font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;overflow-x:hidden}
body{
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,212,255,0.08), transparent),
    radial-gradient(ellipse 60% 50% at 50% 120%, rgba(0,255,157,0.04), transparent),
    var(--bg);
  padding:32px 20px;
  display:flex;
  justify-content:center;
  align-items:flex-start;
}
.wrap{width:100%;max-width:480px}

/* Header */
.head{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:32px;
  padding:0 4px;
}
.logo{
  font-size:14px;
  font-weight:600;
  letter-spacing:3px;
  text-transform:uppercase;
  color:var(--text);
  display:flex;
  align-items:center;
  gap:10px;
}
.logo::before{
  content:'';
  width:8px;height:8px;
  border-radius:50%;
  background:var(--accent);
  box-shadow:0 0 12px var(--accent), 0 0 24px var(--accent-glow);
  animation:pulse 2.5s infinite;
}
@keyframes pulse{
  0%,100%{opacity:1;transform:scale(1)}
  50%{opacity:0.6;transform:scale(0.85)}
}
.online{
  font-size:12px;
  color:var(--text-dim);
  font-variant-numeric:tabular-nums;
  display:flex;
  align-items:center;
  gap:8px;
}
.online b{color:var(--accent);font-weight:600}

/* Tabs */
.tabs{
  display:flex;
  gap:4px;
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:14px;
  padding:4px;
  margin-bottom:24px;
  backdrop-filter:blur(20px);
}
.tab{
  flex:1;
  padding:12px;
  text-align:center;
  font-size:13px;
  font-weight:500;
  color:var(--text-dim);
  border-radius:10px;
  cursor:pointer;
  transition:all 0.3s ease;
  letter-spacing:0.3px;
}
.tab.active{
  background:rgba(0,212,255,0.08);
  color:var(--accent);
  box-shadow:inset 0 0 0 1px rgba(0,212,255,0.2), 0 0 20px rgba(0,212,255,0.08);
}
.tab:hover:not(.active){color:var(--text)}

/* Views */
.view{display:none;animation:fadeIn 0.4s ease}
.view.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* Card */
.card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:20px;
  padding:28px;
  backdrop-filter:blur(20px);
  position:relative;
  overflow:hidden;
}
.card::before{
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(0,212,255,0.3),transparent);
}

.title{
  font-size:11px;
  letter-spacing:3px;
  text-transform:uppercase;
  color:var(--text-dim);
  margin-bottom:20px;
  font-weight:500;
}

/* Inputs */
.field{margin-bottom:14px;position:relative}
.field label{
  display:block;
  font-size:11px;
  letter-spacing:1.5px;
  text-transform:uppercase;
  color:var(--text-dim);
  margin-bottom:8px;
  font-weight:500;
}
.field input{
  width:100%;
  padding:14px 16px;
  background:rgba(0,0,0,0.3);
  border:1px solid var(--border);
  border-radius:10px;
  color:var(--text);
  font-size:14px;
  font-family:inherit;
  outline:none;
  transition:all 0.3s ease;
}
.field input::placeholder{color:var(--text-dim);font-size:13px}
.field input:focus{
  border-color:rgba(0,212,255,0.4);
  box-shadow:0 0 0 3px rgba(0,212,255,0.08), 0 0 20px rgba(0,212,255,0.1);
  background:rgba(0,0,0,0.5);
}

/* Button */
.btn{
  width:100%;
  padding:15px;
  margin-top:8px;
  background:transparent;
  border:1px solid rgba(0,212,255,0.3);
  border-radius:10px;
  color:var(--accent);
  font-size:13px;
  font-weight:600;
  letter-spacing:2px;
  text-transform:uppercase;
  cursor:pointer;
  transition:all 0.3s ease;
  position:relative;
  overflow:hidden;
  font-family:inherit;
}
.btn::before{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(135deg,rgba(0,212,255,0.1),rgba(0,212,255,0.02));
  opacity:0;
  transition:opacity 0.3s ease;
}
.btn:hover::before{opacity:1}
.btn:hover{
  border-color:rgba(0,212,255,0.6);
  box-shadow:0 0 24px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.05);
}
.btn:active{transform:scale(0.98)}
.btn:disabled{
  opacity:0.4;
  cursor:not-allowed;
  border-color:var(--border);
  color:var(--text-dim);
}
.btn:disabled::before{display:none}

.btn-warn{
  border-color:rgba(255,184,0,0.3);
  color:var(--warn);
}
.btn-warn::before{background:linear-gradient(135deg,rgba(255,184,0,0.1),rgba(255,184,0,0.02))}
.btn-warn:hover{border-color:rgba(255,184,0,0.6);box-shadow:0 0 24px rgba(255,184,0,0.15)}

/* Result */
.result{
  margin-top:20px;
  padding:16px;
  border-radius:10px;
  font-size:13px;
  font-weight:600;
  letter-spacing:1.5px;
  text-transform:uppercase;
  text-align:center;
  display:none;
  animation:fadeIn 0.4s ease;
}
.result.show{display:block}
.result.ok{
  background:rgba(0,255,157,0.05);
  border:1px solid rgba(0,255,157,0.2);
  color:var(--ok);
  box-shadow:0 0 24px rgba(0,255,157,0.08);
}
.result.err{
  background:rgba(255,51,102,0.05);
  border:1px solid rgba(255,51,102,0.2);
  color:var(--err);
  box-shadow:0 0 24px rgba(255,51,102,0.08);
}
.result.warn{
  background:rgba(255,184,0,0.05);
  border:1px solid rgba(255,184,0,0.2);
  color:var(--warn);
  text-transform:none;
  letter-spacing:0.5px;
  font-weight:500;
}

/* Captcha */
.captcha-box{
  margin-top:20px;
  padding:20px;
  background:rgba(0,0,0,0.3);
  border:1px solid var(--border);
  border-radius:12px;
  display:none;
  animation:fadeIn 0.4s ease;
}
.captcha-box.show{display:block}
.captcha-box img{
  width:100%;
  border-radius:8px;
  margin-bottom:12px;
  background:#fff;
}

/* Accounts Grid */
.search-box{
  position:relative;
  margin-bottom:16px;
}
.search-box input{
  width:100%;
  padding:12px 16px 12px 40px;
  background:rgba(0,0,0,0.3);
  border:1px solid var(--border);
  border-radius:10px;
  color:var(--text);
  font-size:13px;
  outline:none;
  transition:all 0.3s ease;
  font-family:inherit;
}
.search-box input:focus{
  border-color:rgba(0,212,255,0.4);
  box-shadow:0 0 0 3px rgba(0,212,255,0.08);
}
.search-box::before{
  content:'';
  position:absolute;
  left:16px;top:50%;
  transform:translateY(-50%);
  width:14px;height:14px;
  border:1.5px solid var(--text-dim);
  border-radius:50%;
}
.search-box::after{
  content:'';
  position:absolute;
  left:28px;top:50%;
  transform:translateY(-50%) rotate(45deg);
  width:1.5px;height:6px;
  background:var(--text-dim);
}

.count{
  font-size:11px;
  color:var(--text-dim);
  letter-spacing:1.5px;
  text-transform:uppercase;
  margin-bottom:14px;
  display:flex;
  justify-content:space-between;
}
.count b{color:var(--accent);font-weight:600}

.grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:8px;
  max-height:440px;
  overflow-y:auto;
  padding-right:4px;
}
.grid::-webkit-scrollbar{width:4px}
.grid::-webkit-scrollbar-track{background:transparent}
.grid::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.2);border-radius:2px}

.item{
  background:rgba(0,0,0,0.3);
  border:1px solid var(--border);
  border-radius:10px;
  padding:14px 12px;
  cursor:pointer;
  transition:all 0.25s ease;
  text-align:left;
  min-height:72px;
  display:flex;
  align-items:center;
}
.item:hover{
  border-color:rgba(0,212,255,0.3);
  background:rgba(0,212,255,0.03);
  transform:translateY(-1px);
  box-shadow:0 4px 20px rgba(0,212,255,0.08);
}
.item span{
  font-size:12px;
  font-weight:500;
  line-height:1.4;
  color:var(--text);
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

/* Modal */
.modal{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.85);
  backdrop-filter:blur(12px);
  display:none;
  justify-content:center;
  align-items:center;
  z-index:1000;
  padding:20px;
  animation:fadeIn 0.25s ease;
}
.modal.show{display:flex}
.modal-body{
  background:var(--surface-2);
  border:1px solid var(--border);
  border-radius:20px;
  padding:28px;
  width:100%;
  max-width:400px;
  position:relative;
  animation:modalIn 0.3s cubic-bezier(0.16,1,0.3,1);
}
@keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.modal-body::before{
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(0,212,255,0.4),transparent);
}
.modal-title{
  font-size:13px;
  letter-spacing:2px;
  text-transform:uppercase;
  color:var(--accent);
  text-align:center;
  margin-bottom:24px;
  font-weight:600;
  line-height:1.4;
}
.row{
  display:flex;
  gap:8px;
  margin-bottom:10px;
  align-items:center;
}
.row label{
  width:60px;
  font-size:10px;
  letter-spacing:1.5px;
  text-transform:uppercase;
  color:var(--text-dim);
  font-weight:500;
}
.row input{
  flex:1;
  padding:11px 12px;
  background:rgba(0,0,0,0.4);
  border:1px solid var(--border);
  border-radius:8px;
  color:var(--text);
  font-family:'SF Mono',Consolas,monospace;
  font-size:12px;
  outline:none;
}
.row button{
  padding:11px 14px;
  background:transparent;
  border:1px solid var(--border);
  border-radius:8px;
  color:var(--text-dim);
  font-size:11px;
  font-weight:600;
  letter-spacing:1px;
  text-transform:uppercase;
  cursor:pointer;
  transition:all 0.2s ease;
  font-family:inherit;
}
.row button:hover{
  border-color:var(--accent);
  color:var(--accent);
  box-shadow:0 0 12px rgba(0,212,255,0.15);
}
.row button.copied{
  border-color:var(--ok);
  color:var(--ok);
  background:rgba(0,255,157,0.05);
}

.btn-check{
  width:100%;
  padding:13px;
  margin-top:16px;
  background:transparent;
  border:1px solid rgba(0,255,157,0.3);
  border-radius:10px;
  color:var(--ok);
  font-size:12px;
  font-weight:600;
  letter-spacing:2px;
  text-transform:uppercase;
  cursor:pointer;
  transition:all 0.3s ease;
  font-family:inherit;
}
.btn-check:hover{
  border-color:rgba(0,255,157,0.6);
  box-shadow:0 0 24px rgba(0,255,157,0.15);
  background:rgba(0,255,157,0.03);
}
.btn-check:disabled{opacity:0.4;cursor:not-allowed}

.btn-close{
  width:100%;
  padding:12px;
  margin-top:10px;
  background:transparent;
  border:1px solid var(--border);
  border-radius:10px;
  color:var(--text-dim);
  font-size:11px;
  font-weight:600;
  letter-spacing:2px;
  text-transform:uppercase;
  cursor:pointer;
  transition:all 0.2s ease;
  font-family:inherit;
}
.btn-close:hover{border-color:rgba(255,51,102,0.3);color:var(--err)}

.modal-result{
  margin-top:14px;
  padding:12px;
  border-radius:8px;
  font-size:12px;
  font-weight:600;
  letter-spacing:1.5px;
  text-transform:uppercase;
  text-align:center;
  display:none;
}
.modal-result.show{display:block;animation:fadeIn 0.3s ease}

/* Footer */
.footer{
  margin-top:24px;
  padding:0 4px;
}
.tg{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  padding:14px;
  background:transparent;
  border:1px solid rgba(42,171,238,0.25);
  border-radius:12px;
  color:var(--tg);
  text-decoration:none;
  font-size:12px;
  font-weight:600;
  letter-spacing:2px;
  text-transform:uppercase;
  transition:all 0.3s ease;
}
.tg:hover{
  border-color:rgba(42,171,238,0.5);
  box-shadow:0 0 24px rgba(42,171,238,0.15);
  background:rgba(42,171,238,0.03);
}
.tg svg{width:16px;height:16px;fill:currentColor}

.empty{
  text-align:center;
  padding:40px 20px;
  color:var(--text-dim);
  font-size:13px;
}
</style>
</head>
<body>
<div class="wrap">

  <div class="head">
    <div class="logo">Steam Tools</div>
    <div class="online"><b id="onlineCount">0</b> online</div>
  </div>

  <div class="tabs">
    <div class="tab active" data-view="checker">Проверка</div>
    <div class="tab" data-view="accounts">Общие аккаунты</div>
  </div>

  <!-- CHECKER VIEW -->
  <div class="view active" id="view-checker">
    <div class="card">
      <div class="title">Auth Check</div>
      <div class="field">
        <label>Логин</label>
        <input type="text" id="username" placeholder="steam login" autocomplete="off">
      </div>
      <div class="field">
        <label>Пароль</label>
        <input type="password" id="password" placeholder="••••••••">
      </div>
      <button class="btn" id="checkBtn">Проверить</button>

      <div class="captcha-box" id="captchaBox">
        <img id="captchaImage" alt="captcha">
        <div class="field" style="margin-bottom:10px">
          <input type="text" id="captchaText" placeholder="код с картинки">
        </div>
        <button class="btn btn-warn" id="captchaBtn">Отправить</button>
      </div>

      <div class="result" id="result"></div>
    </div>
  </div>

  <!-- ACCOUNTS VIEW -->
  <div class="view" id="view-accounts">
    <div class="card">
      <div class="title">Shared Accounts</div>
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Поиск игры...">
      </div>
      <div class="count">
        <span>Найдено: <b id="countNum">0</b></span>
        <span>Всего: <b id="totalNum">0</b></span>
      </div>
      <div class="grid" id="grid"></div>
    </div>
  </div>

  <div class="footer">
    <a href="https://t.me/MirArenDaff" target="_blank" class="tg">
      <svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.319.016.101.017.204.011.285z"/></svg>
      Подпишись
    </a>
  </div>

</div>

<!-- MODAL -->
<div class="modal" id="modal">
  <div class="modal-body">
    <div class="modal-title" id="modalTitle"></div>
    <div class="row">
      <label>Логин</label>
      <input type="text" id="mLogin" readonly>
      <button onclick="copy('mLogin',this)">Copy</button>
    </div>
    <div class="row">
      <label>Пароль</label>
      <input type="text" id="mPassword" readonly>
      <button onclick="copy('mPassword',this)">Copy</button>
    </div>
    <button class="btn-check" id="mCheckBtn">Проверить аккаунт</button>
    <div class="modal-result" id="mResult"></div>
    <button class="btn-close" onclick="closeModal()">Закрыть</button>
  </div>
</div>

<script>
// TABS
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('view-'+t.dataset.view).classList.add('active');
    if(t.dataset.view==='accounts')renderGrid();
  });
});

// ACCOUNTS GRID
function renderGrid(filter=''){
  const grid=document.getElementById('grid');
  const f=filter.toLowerCase().trim();
  const list=f?sharedAccounts.filter(a=>a.game.toLowerCase().includes(f)):sharedAccounts;
  document.getElementById('countNum').textContent=list.length;
  document.getElementById('totalNum').textContent=sharedAccounts.length;
  if(!list.length){
    grid.innerHTML='<div class="empty" style="grid-column:1/-1">Ничего не найдено</div>';
    return;
  }
  grid.innerHTML=list.map((a,i)=>{
    const idx=sharedAccounts.indexOf(a);
    return '<div class="item" onclick="openModal('+idx+')"><span>'+escapeHtml(a.game)+'</span></div>';
  }).join('');
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

document.getElementById('searchInput').addEventListener('input',e=>renderGrid(e.target.value));

// MODAL
function openModal(i){
  const a=sharedAccounts[i];
  document.getElementById('modalTitle').textContent=a.game;
  document.getElementById('mLogin').value=a.login;
  document.getElementById('mPassword').value=a.password;
  document.getElementById('mResult').classList.remove('show');
  document.getElementById('mCheckBtn').disabled=false;
  document.getElementById('mCheckBtn').textContent='Проверить аккаунт';
  document.getElementById('modal').classList.add('show');
}
function closeModal(){document.getElementById('modal').classList.remove('show')}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});

function copy(id,btn){
  const el=document.getElementById(id);
  el.select();el.setSelectionRange(0,99999);
  navigator.clipboard.writeText(el.value).then(()=>{
    const orig=btn.textContent;
    btn.textContent='✓';
    btn.classList.add('copied');
    setTimeout(()=>{btn.textContent=orig;btn.classList.remove('copied')},1500);
  });
}

async function checkModal(){
  const login=document.getElementById('mLogin').value;
  const pass=document.getElementById('mPassword').value;
  const btn=document.getElementById('mCheckBtn');
  const res=document.getElementById('mResult');
  btn.disabled=true;btn.textContent='Проверка...';
  res.classList.remove('show');
  try{
    const r=await fetch('/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:login,password:pass,captcha_gid:'-1',captcha_text:''})});
    const d=await r.json();
    res.classList.add('show');
    if(d.status==='success'){res.className='modal-result show ok';res.textContent='Аккаунт работает';res.style.background='rgba(0,255,157,0.05)';res.style.border='1px solid rgba(0,255,157,0.2)';res.style.color='var(--ok)'}
    else{res.className='modal-result show err';res.textContent='Аккаунт не работает';res.style.background='rgba(255,51,102,0.05)';res.style.border='1px solid rgba(255,51,102,0.2)';res.style.color='var(--err)'}
  }catch(e){
    res.classList.add('show');
    res.className='modal-result show err';
    res.textContent='Ошибка соединения';
    res.style.background='rgba(255,51,102,0.05)';
    res.style.border='1px solid rgba(255,51,102,0.2)';
    res.style.color='var(--err)';
  }finally{btn.disabled=false;btn.textContent='Проверить аккаунт'}
}
document.getElementById('mCheckBtn').addEventListener('click',checkModal);

// CHECKER LOGIC
let captchaGid='-1',cooldown=null;
const COOLDOWN=15;

function startCooldown(){
  const btn=document.getElementById('checkBtn');
  let r=COOLDOWN;
  btn.disabled=true;btn.textContent='Подождите '+r+'с';
  if(cooldown)clearInterval(cooldown);
  cooldown=setInterval(()=>{
    r--;
    if(r<=0){clearInterval(cooldown);cooldown=null;btn.disabled=false;btn.textContent='Проверить'}
    else btn.textContent='Подождите '+r+'с';
  },1000);
}

function showResult(type,text){
  const r=document.getElementById('result');
  r.className='result show '+type;
  r.textContent=text;
}

async function doCheck(login,pass,gid,text){
  try{
    const r=await fetch('/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:login,password:pass,captcha_gid:gid,captcha_text:text})});
    return await r.json();
  }catch(e){return{status:'error'}}
}

document.getElementById('checkBtn').addEventListener('click',async()=>{
  const u=document.getElementById('username').value.trim();
  const p=document.getElementById('password').value.trim();
  if(!u||!p){showResult('err','Заполните поля');return}
  const btn=document.getElementById('checkBtn');
  btn.disabled=true;btn.textContent='Проверка...';
  document.getElementById('result').classList.remove('show');
  document.getElementById('captchaBox').classList.remove('show');
  const d=await doCheck(u,p,'-1','');
  if(d.status==='captcha'){
    captchaGid=d.captcha_gid;
    document.getElementById('captchaImage').src='/api/captcha/'+captchaGid;
    document.getElementById('captchaBox').classList.add('show');
    showResult('warn','Требуется капча');
  }else if(d.status==='success'){
    showResult('ok','Аккаунт работает');
  }else{
    showResult('err','Аккаунт не работает');
  }
  btn.disabled=false;btn.textContent='Проверить';
  startCooldown();
});

document.getElementById('captchaBtn').addEventListener('click',async()=>{
  const u=document.getElementById('username').value.trim();
  const p=document.getElementById('password').value.trim();
  const t=document.getElementById('captchaText').value.trim();
  if(!t){showResult('err','Введите код');return}
  const btn=document.getElementById('captchaBtn');
  btn.disabled=true;btn.textContent='Проверка...';
  const d=await doCheck(u,p,captchaGid,t);
  if(d.status==='captcha'){
    document.getElementById('captchaImage').src='/api/captcha/'+d.captcha_gid+'?t='+Date.now();
    captchaGid=d.captcha_gid;
    document.getElementById('captchaText').value='';
    showResult('warn','Неверная капча');
  }else if(d.status==='success'){
    document.getElementById('captchaBox').classList.remove('show');
    showResult('ok','Аккаунт работает');
  }else{
    document.getElementById('captchaBox').classList.remove('show');
    showResult('err','Аккаунт не работает');
  }
  btn.disabled=false;btn.textContent='Отправить';
  startCooldown();
});

// ONLINE
let sid=sessionStorage.getItem('sid');
if(!sid){sid=Math.random().toString(36).slice(2);sessionStorage.setItem('sid',sid)}
function ping(){fetch('/ping',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:sid})}).catch(()=>{})}
setInterval(ping,10000);ping();
function updateOnline(){fetch('/stats').then(r=>r.json()).then(d=>{document.getElementById('onlineCount').textContent=d.online}).catch(()=>{})}
setInterval(updateOnline,5000);updateOnline();
</script>
</body>
</html>`;

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
