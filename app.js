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

// ============================================================
// ОБЩИЕ АККАУНТЫ (все из экспорта Telegram-канала)
// l = login, p = password, g = games (строка через запятую)
// ============================================================
const SHARED_ACCOUNTS = [
{l:"beamngdrive123steam1",p:"Kte!22ijaAII12",g:"BeamNG.Drive"},
{l:"mosgq70379",p:"oeldf55726",g:"Kingdom Come Deliverance 2"},
{l:"uncharted_st",p:"UNCHARTED@8804",g:"UNCHARTED: Legacy of Thieves Collection"},
{l:"nmsukt191",p:"batzaza191",g:"Forza Horizon 4, ARK Survival, LEGO Batman"},
{l:"gfk66337",p:"Acp234213",g:"Black Myth Wukong"},
{l:"0855j9",p:"zZ10301030",g:"GTA 5, Resident Evil 2, Resident Evil 3, Ведьмак 3"},
{l:"groggymovement4",p:"DCN_LliOQhv",g:"Marvel's Spider Man 2"},
{l:"ynysa422",p:"@Gamerspace123",g:"Red Dead Redemption 2"},
{l:"rnmiike",p:"THEGODMIKE1",g:"NBA 2K20, GTA San Andreas, GTA 5"},
{l:"mklvn2y9",p:"zhizhure1221",g:"Marvel's Spider Man Remastered"},
{l:"STEAMGAMESTT1",p:"funpay.com/users/6932278/",g:"The Last Of Us 2 Remastered, TLOU Remastered, Geometry Dash, RE 2/3/4"},
{l:"nicasacracacenri",p:"EBA9Y59KGCTB",g:"Hogwarts Legacy"},
{l:"jocuriargenrinia",p:"70Games.net92",g:"Resident Evil 7 Biohazard"},
{l:"wqm322495",p:"ac7QPfa3",g:"Grand Theft Auto 4"},
{l:"vonterr",p:"889162",g:"Horizon Forbidden West Complete Edition"},
{l:"orderlyinoculat",p:"axQUk8etMajK",g:"Cyberpunk 2077"},
{l:"earthlnwza5566",p:"2G6TEM5ZAZC6",g:"Dying Light 2, Dying Light, Sons Of The Forest, The Forest, Forza Horizon 4"},
{l:"nfpprsq3h",p:"f1qslg5kp",g:"Euro Truck Simulator 2"},
{l:"wf6ju3bf5wc3",p:"qKnh6N9SLiMxyvXVX36d",g:"Atomic Heart"},
{l:"bej01201",p:"Bejdw11201",g:"Forza Horizon 5"},
{l:"dimkoxd",p:"2G6TEM5ZAZC6",g:"COD MW2, Efootball Pes 2021"},
{l:"steam123z17",p:"ZXCVBNMQQ",g:"Mortal Kombat 11, Euro Truck Simulator 2"},
{l:"Mortalk1pehkflt01",p:"TGVBFRETt01",g:"Mortal Kombat 1"},
{l:"neylavewe1985",p:"wFbmEcKQ",g:"Farming Simulator 25"},
{l:"negri_pidor1488",p:"fjbjnoDEFSjkndfgzhjkoCDSA09",g:"Metro series, Sons Of The Forest, Dying Light, Witcher 3, Mafia 2"},
{l:"xxyenlover",p:"34cv56BN",g:"FIFA 22"},
{l:"quincypugy",p:"0Heh%v4SSG",g:"Terraria, Baldi's Basics Classic Remastered"},
{l:"meteprotr",p:"3D88ASX2AMCG",g:"Hearts Of Iron 4, Batman Arkham Asylum"},
{l:"thnavud1",p:"0641769856Za",g:"Witcher 3, ARK Survival"},
{l:"soham123419",p:"Funpay-0nibist",g:"COD MW 2019, Spider Man, Far Cry 3, Max Payne 3, AC 3"},
{l:"hhied98481",p:"Deaiwoq217",g:"The Forest, Outlast 2"},
{l:"Detroit_st",p:"DETROIT@7401",g:"Detroit Become Human"},
{l:"bejdw24074",p:"steamkk.com",g:"Resident Evil 4 Remake"},
{l:"YaKrycheVasFP",p:"VM@KLGT8W34C",g:"Dying Light, Euro Truck Simulator 2, Left 4 Dead 2"},
{l:"pq3sz8ar9rx8",p:"SZ7ZF8YSFCXE",g:"Forza Horizon 5 + все DLC"},
{l:"xbeverysketch",p:"st3@mxx645",g:"Call Of Duty Black Ops 3"},
{l:"rd5977",p:"951753852.ACHU",g:"FIFA 21, FIFA 22"},
{l:"juscelinolira",p:"CDTBTD66XEX6",g:"Days Gone, EA Sports FC 24, GTA 5"},
{l:"SDACHAvARENDY01",p:"$j2si2jLDSJFJ2Nsj",g:"Sons Of The Forest, The Forest, Schedule, R.E.P.O, Hitman Absolution"},
{l:"shushi_elden_ring",p:"Owner_shushiGames_Seller",g:"Elden Ring, Ведьмак 3"},
{l:"red_dead_profix",p:"DASjsaj72ow8",g:"Red Dead Redemption 2, Ведьмак 3"},
{l:"sunzshiine",p:"msmb1122",g:"COD MW3, GTA 4, COD MW2, COD Black Ops"},
{l:"pandagame4418",p:"cod1452141",g:"Call Of Duty WW2"},
{l:"aboodack",p:"DC5Z25E465DX",g:"Silent Hill 2"},
{l:"zhangben6662",p:"BNKGTsnMWu",g:"Battlefield 5, ARK Survival"},
{l:"cyberhitler1488",p:"Bbuv837FSgnB2",g:"Metro Last Light, Metro Exodus, Cyberpunk 2077, The Forest, Miside"},
{l:"gihmt99337",p:"my_funpay_dtgame",g:"Ghost Of Tsushima"},
{l:"mario_wukong",p:"QCP7PFHMW4VV",g:"Black Myth Wukong"},
{l:"ShezyyyFunPay",p:"funpay.com/users/8943271/",g:"Assetto Corsa, Euro Truck Simulator 2, City Car Driving, My Summer Car"},
{l:"opgarpstore1",p:"safEA24O-",g:"Metro Exodus и другие игры"},
{l:"polszymek123",p:"Funpay-Onibist1",g:"Spider Man Miles Morales, Hello Neighbor"},
{l:"hazer3",p:"S2477TT27EC6",g:"Mafia 2 Definitive Edition, Skyrim"},
{l:"Shixize1",p:"PwxcoNGgFM",g:"NBA 2K22"},
{l:"sss0614",p:"Mafia$75",g:"Mafia Definitive Edition, Mafia 3, Mafia 2 DE"},
{l:"mbig4912",p:"Eb2PLbZ3",g:"BeamNG.drive"},
{l:"05796591",p:"Derkyt111666",g:"Sekiro Shadows Die Twice"},
{l:"nrbon69177",p:"meisonlyme1A",g:"Hogwarts Legacy, Ghost Of Tsushima"},
{l:"amlv63032",p:"CExXMoJXF1TU",g:"DayZ"},
{l:"mayli1001",p:"MqPN05kcpk89",g:"God Of War, Tomb Rider"},
{l:"phvmg47604",p:"bfmjj99570",g:"Kingdom Come Deliverance 2"},
{l:"fdsfdsfds9824",p:"x2jrrd7mef3jqSX",g:"Doom The Dark Ages"},
{l:"dart1997",p:"YXJYS80P7164",g:"God Of War Ragnarok"},
{l:"dgb236444",p:"tjjn248562",g:"Clair Obscur Expedition 33"},
{l:"hiyondw615",p:"sp9wyq8s",g:"The Last Of Us Remastered"},
{l:"Thragg_767",p:"ev8Z5YyvY42RmiX",g:"LEGO Harry Potter, Elden Ring, Cuphead, Hitman 2, Terraria, Geometry Dash"},
{l:"mardiprawdziwy",p:"G4market999",g:"Cyberpunk 2077"},
{l:"NEW2SPIDERSMANOFF581",p:"jMc3rP#=lBu{43fz{-v",g:"Spider Man Remastered, Spider Man Miles Morales"},
{l:"RsgKingz",p:"Deshawn2010$",g:"GTA 5, Rust, Among Us"},
{l:"ihhza24z",p:"4ytb9naa",g:"GTA Vice City, Hitman 2, Hitman Absolution, Fallout 3"},
{l:"8782146147",p:"Derkytt090934",g:"Black Myth Wukong"},
{l:"wbtq1089352",p:"steamok778899",g:"Forza Horizon 5"},
{l:"74gub9322di6",p:"tjjn248562",g:"Stalker Shadow Of Chornobyl"},
{l:"xd7e5b",p:"djCZiNsY",g:"Silent Hill 2 Remake"},
{l:"necros13579",p:"13579zef",g:"Cyberpunk 2077, Metro Exodus, Mafia"},
{l:"pf7yq3uu8ry9",p:"Tu2Ww3Uk1Ok6",g:"Forza Horizon 4"},
{l:"ghuzn91928",p:"PexhPCWAW4",g:"60 Seconds Reatomized"},
{l:"uihgee2505",p:"g1r506wh1a56wehr106",g:"GTA 5, Forza Horizon 5, Assetto Corsa"},
{l:"su0wn1hf",p:"UOipTT58vG5XZ1",g:"Cuphead"},
{l:"gaonengDW77703",p:"05698748",g:"Elden Ring Nightreign"},
{l:"k8ef0k53f",p:"RaysShopAkk!2",g:"The Last Of Us 2 Remastered"},
{l:"markoparada2011",p:"5https://t.me/steamiq",g:"Hello Neighbor"},
{l:"kk80401",p:"kk223344kkwdw",g:"NBA 2K25"},
{l:"paraguaapeek",p:"2deenerodel2003",g:"Far Cry 5, FIFA 22, Far Cry 3"},
{l:"34095617",p:"YDMBXMK7EK3K",g:"Don't Starve Together, Black Myth Wukong, Forza Horizon 4"},
{l:"fpfuryfamily",p:"thxfp362",g:"Crysis 3 Remastered"},
{l:"cretosesat1971",p:"JYQaFwd7zh",g:"God Of War Ragnarok"},
{l:"moguchichlen228",p:"JBVAo_432fe1f",g:"Ghost Of Tsushima, Dying Light The Beast"},
{l:"fk1xo6tz8bt7",p:"cTiAP4Jh3xfW",g:"Forza Horizon 4, Cyberpunk 2077"},
{l:"fpsquimeeminon1",p:"funpaysquimeeminon2",g:"Dead Island 2, Dying Light"},
{l:"arenda9121",p:"Ytrnj274",g:"Pragmata, Crimson Desert, Forza Horizon 6, Subnautica 2"},
{l:"pablo79911",p:"F552YFK7K5B9",g:"God Of War Ragnarök, Blood Strike, House Flipper, Space Aces"},
{l:"aurelie_8283",p:"8DDE8XKS8GSK",g:"Farming Simulator 22"},
{l:"stillyn",p:"Asdzxc1234)))))",g:"Серия Call Of Duty"},
{l:"mj09uq5kw",p:"KKg0xvKyzVNs6y",g:"Ready Or Not"},
{l:"financialscorpion39551",p:"n40saxt50yiyn4g!zru3b",g:"COD MW 2019, Combat Master, Skate"},
{l:"alridergans1985",p:"qJgS2p5PEL1992",g:"Horizon Zero Dawn, Cyberpunk 2077, Drift Legends 2, Space War"},
{l:"ricciganggame",p:"https://funpay.com/users/5644459/",g:"Hollow Knight Silksong, Hollow Knight, Crimson Desert, Dying Light, Mafia 2, TLOU Part 1, RE Requiem"},
{l:"marianalvarezzz1992",p:"Yanier1992",g:"FIFA 22, ARK Survival Evolved"},
{l:"zon_jb",p:"Tomteland98",g:"Hogwarts Legacy, WRC 7, WRC 5"},
{l:"neffffffffex",p:"https://funpay.com/users/17414395/",g:"MK X, MK 11, Detroit, Crysis 3/2 Remastered, Outlast, The Forest, Sons Of The Forest, Dishonored, The Long Dark, City Car Driving"},
{l:"shenghuaweiji2a",p:"Hh6039512a",g:"Resident Evil 2 Remake"},
{l:"oiydz866",p:"chengyu456778",g:"God Of War 2018 + фурри игры"},
{l:"tozinabro1977",p:"2CH4bGOe6S1978",g:"COD Vanguard, Hello Neighbor"},
{l:"coranhart",p:"H9mqE6og31",g:"FIFA 23, Euro Truck Simulator 2, Pes 2016"},
{l:"ba1aq2qp1fq4",p:"Gf9Jr5Oh1Ek9",g:"Grid 2, BeamNG, Sleeping Dogs DE, Dead By Daylight, Prince Of Persia series, ETS2, Marvel's Midnight Suns, TEKKEN 7, Shadow of Tomb Rider, Uncharted 4, Hitman 2, Batman Arkham, Mafia trilogy, Elder Scrolls, HOI4, LEGO Marvel, MK 11, Kingdom Come"},
{l:"dukanvaettname",p:"bananvagen1",g:"GTA IV, GTA V, Days Gone, Far Cry 5, Far Cry Primal, Tomb Raider Trilogy, Sleeping Dogs, Max Payne 3, Just Cause 2/3, Star Wars Jedi, For Honor"},
{l:"fuogl63477",p:"siuk94330T",g:"Ghost Of Tsushima"},
{l:"cwn_apollo2",p:"LiamWright05102005",g:"Gang Beasts"},
{l:"rvmxh26513",p:"cLKz95R5f1",g:"Garry's mod, Hollow Knight, Geometry Dash, Forza Horizon 5, The Forest, Silksong, Metro 2033, BeamNG, ARC Raiders, Palworld, Among Us, Hitman WoA, Terraria, Spore, Far Cry 3, Cities Skylines, Mafia III DE, Train Sim World 6, Detroit, L4D2, DBD, ETS2, Doom Eternal, Raft"},
{l:"majinluffy1420",p:"Supreme1025",g:"Phasmophobia, MK X, South Park, CarX Drifting, Dark Deception, Skater XL"},
{l:"sp2_by_heero",p:"https://t.me/steamaccountsog",g:"Marvel's Spider Man 2"},
{l:"99892722",p:"04216324",g:"Doom Eternal, Borderlands 2, Russian Fishing 4, Postal, Warframe"},
{l:"cnykqx48s",p:"Progamer@",g:"Marvel's Spider Man Miles Morales"},
{l:"lu8xq0oo0id9",p:"XKDS65SGGKD2",g:"Prototype 2"},
{l:"david22102007",p:"D22102007",g:"Mad Max, MK X"},
{l:"wecd820201",p:"dddQIK2Yb",g:"GTA 5 Legacy, GTA 5 Enhanced, Naraka Bladepoint"},
{l:"HogwartsLegacy14@yandex.ru",p:"H57&734%497$Forza5",g:"Xbox Game Pass"},
{l:"HogwartsLegacy18@yandex.ru",p:"H57&734%497$Forza6",g:"Xbox Game Pass"},
{l:"MaroPratte4381@outlook.com",p:"Marotado-Seller",g:"Xbox Game Pass Ultimate"},
{l:"dedqs21651",p:"FrZ78mgY",g:"The Quarry, Hitman Blood Money, RE 7, RE 2/4 Remake, Mafia DE, Cyberpunk 2077, RE Requiem + more"},
{l:"rostokrrfan1",p:"alpharacer54",g:"MK 11, Control, The Forest, Geometry Dash, Wolfenstein 2, Buckshot Roulette, Metro 2033/Exodus, No Man's Sky, DBD, LEGO Marvel, Silksong, ETS2, Detroit, Car Mechanic Sim, Phasmophobia, L4D2, HL2, Garry's Mod, Portal 2, Mad Max, Dying Light"},
{l:"mfvmm13938",p:"odukh69931",g:"Atomic Heart, Ведьмак 3, Terraria, Ведьмак 2, ETS2, Hitman Blood Money, Drift Legends 2, Control, Just Cause 3, Destiny 2, Tomb Raider series, The Forest, Dying Light, Binding of Isaac, Heavy Rain, Metro trilogy, Batman Arkham, Assetto Corsa"},
{l:"gutichelenar",p:"TMQO5QAyQm1!Aa",g:"COD MW2 2022"},
{l:"roughturtle5149",p:"5118db8f1bd2093e1!aZ",g:"MX vs ATV Reflex, MXGP 3"},
{l:"58786917",p:"25925863",g:"Riders Republic"},
{l:"ZZGGheM43",p:"ww4222112",g:"Dead Space Remake + more"},
{l:"vaio12343",p:"Gabi2206",g:"Farming Simulator 15/22, ETS2, Snow Runner"},
{l:"hfsdfz",p:"xvdgfghfh",g:"Subnautica"},
{l:"logikxsense",p:"millionnM9(",g:"Death Stranding, RDR2, Hello Neighbor 1/2, Ghost Recon, RE 6"},
{l:"wfzp40009",p:"fv1vl2e8q",g:"Spider Man Miles Morales, Pes 2016"},
{l:"uexq59805",p:"jjackson14",g:"COD MW2 2022"},
{l:"Hamorilal",p:"Gk6q63F1",g:"Spider Man Remastered, Miles Morales, Spider Man 2"},
{l:"tukitarosu",p:"tarotyan929",g:"RE 2/3 Remastered, RE 4 (2005), RE 7 Beginning Hour, RE Resistance, RE 6, Life is Strange"},
{l:"paiidmaine",p:"Tremaine45",g:"NBA 2K24"},
{l:"pokopowfighting",p:"Pororo33",g:"Demon Slayer 1/2, Naruto Ultimate Ninja Storm 4 + more"},
{l:"drizzelkanes",p:"Justinp16(!)",g:"F1 21, F1 20"},
{l:"unusualweasel31181",p:"84uphe8dt430hst.5gdlp",g:"PvZ Garden Warfare 2 DE"},
{l:"flgta011",p:"goruto27",g:"Doom + Doom II, Dying Light, Frontline 1942, GTA 5 Legacy/Enhanced, Pay Day, Pay Day 2, Project Zomboid"},
{l:"toferresident1",p:"Resident@1122",g:"RE 2 Remake, RE 3 Remake, RE 4 Remake"},
{l:"sasuke31053",p:"lYipMaspH1ra",g:"Human Fall Flat, Naruto, Just Cause 3, Gang Beasts, Watch Dogs 2, Stick Fight, GTA 5 Enhan, DBD, Tomb Rider, Sniper GW, ARK, Mirror's Edge, SMITE, Pixark"},
{l:"Cu98721",p:"Tam0768838298@@",g:"Subnautica 2, 007 First Light"},
{l:"by_heero",p:"https://t.me/steamaccountsog",g:"Sekiro, Pes 2016, Ведьмак 3, Cyberpunk 2077, Muck, Rage 2, Blood Strike, Destiny 2, Marvel Rivals"},
{l:"yromadev1",p:"xDvTSb37UyBRsY",g:"Farming Simulator 25"},
{l:"enova36601",p:"aynhs76029",g:"Mafia 2 Classic, Mafia 2 DE, Mafia DE"},
{l:"ou72852",p:"Hh2468iut",g:"Cyberpunk 2077"},
{l:"ooSniperDeluxeoo",p:"DEL9OElite8Sniper9",g:"Sniper Elite 5, Sniper Elite 4"},
{l:"fredglover1960",p:"nqszzger9229$!1v0",g:"FNAF Secret Of Mimic"},
{l:"Ds2Im2Nk3Gy2",p:"Ud9Mw0Mo7Iu7",g:"NBA 2K26"},
{l:"zgejcplxny",p:"tvzE3igz2A",g:"Rust"},
{l:"funnymassivepony08",p:"Roundkick991XME342",g:"Forza Horizon 5"},
{l:"zuopy28956",p:"elib56353E",g:"Five Nights At Freddy's"},
{l:"wgum29vkmrnjv",p:"raRN9AGCUPljKdlSL4",g:"Death Stranding 2 On The Beach"},
{l:"ao0na8xp5yp2",p:"Mn6Ld9Ex1Fr8",g:"Uncharted Legacy Of Thieves"},
{l:"zalobechi1983",p:"NJLZ4LWNTY1989",g:"Stalker 2 Heart Of Chernobyl"},
{l:"pmrh73716",p:"chengyu2444477",g:"Stray"},
{l:"farcryxiajsh",p:"playerok.com/profile/QAVIX",g:"Far Cry 1-6"},
{l:"probunloti1982",p:"an41526kx",g:"Construction Simulator"},
{l:"Ht7Zq6Ed8Ga1",p:"Tl0Jy8Gl9Fq5",g:"BeamNG.drive"},
{l:"Direp12",p:"112314533Q",g:"Hello Neighbor 1/2, Miside"},
{l:"sfsefawd",p:"sef435$%#",g:"Ghost Of Tsushima, Far Cry 6, COD MW2 2022"},
{l:"babai0_02",p:"Kasra.0919",g:"Assetto Corsa"},
{l:"twistnewold",p:"5sMgwST4L5j",g:"Lego Marvel Super Heroes"},
{l:"fara070707",p:"2MGKD64TADZ6",g:"Uncharted Legacy Of Thieves Collection"},
{l:"kewbt36891",p:"FunPaySAPOZNIK",g:"The Forest, PC Building Simulator, Granny Remake"},
{l:"gsmqj33321",p:"conew50689",g:"Quarantine Zone"},
{l:"GenaLovitop",p:"H4AkpmakTpiE",g:"(игры на фото)"},
{l:"crcrm50983",p:"Btzeeman21",g:"Call Of Duty Modern Warfare"},
{l:"wcicatricew",p:"marpanov_free9",g:"Hitman World Of Assassination"},
{l:"xa3ut6az1dh8",p:"Yk2Rx0Wg7Lr2",g:"(игры на фото)"},
{l:"mtaw23551",p:"mtaw123456",g:"Sea of Thieves"},
{l:"qqq2549",p:"playerok.com/profile/QAVIX",g:"MK 11, MK X, Forza Horizon 5"},
{l:"uoorf89087",p:"fxzer58595",g:"BeamNG"},
{l:"funpuy214521_",p:"Arsenicgya2112-",g:"Hello Neighbor, Detroit, Hitman, Geometry Dash, L4D"},
{l:"arks62",p:"playerokTovarStoreRe",g:"COD WW2 + хорошая библиотека"},
{l:"mmzjlo8x",p:"glIIsTNozyiu",g:"COD MW3 2023"},
{l:"bejdw16664",p:"Bejdw14666",g:"Devil May Cry HD Collection"},
{l:"ibgyu26556",p:"rsrcn57927",g:"Furry Whores, 69 love, Geometry Dash"},
{l:"rambozy2120",p:"Jack2120",g:"GTA 5, CoD, Rust"},
{l:"nfs_mostwanted2005",p:"mazone_shop_nfsmw2005",g:"NFS Most Wanted 2005 + много игр"},
{l:"JaraxovAnton",p:"Iphone783",g:"много разных игр"},
{l:"hqhmq15120",p:"yhcga08962",g:"Resident Evil Requiem"},
{l:"thb112074",p:"steamok000",g:"Getting Over It"},
{l:"wes1370",p:"Gfrt8809",g:"GTA V Legacy/Enhanced"},
{l:"onlykickf313",p:"70Games.net145",g:"Don't Starve Together"},
{l:"rastyachap",p:"Ezskydream1",g:"TLOU Remastered + TLOU 2"},
{l:"lcfwd145",p:"steamok1122",g:"Barotrauma"},
{l:"keozz_ytb",p:"30https://t.me/steamiq",g:"Internet Cafe Simulator 2"},
{l:"h726921957821",p:"30https://t.me/steamiq",g:"Days Gone"},
{l:"Sgamin771",p:"Gaming888",g:"Resident Evil 8 Village"},
{l:"egor_pomidor91",p:"!UsEdRuGs3!",g:"Cyberpunk 2077"},
{l:"kp898232",p:"kp2627552",g:"Kingdom Come Deliverance 2"},
{l:"Zm2Io0Px9Ro8",p:"7https://t.me/steamiq",g:"Metro Last Light"},
{l:"dinobozz1",p:"ZI5XqvhDMhpOhaQRfgQCo",g:"Mafia 2 DE + Classic"},
{l:"thelast1q",p:"playerok.com/profile/QAVIX",g:"TLOU Remastered, TLOU 2 Remastered, My Sexy Neighbor"},
{l:"luisviseu1",p:"JEgsvAHH",g:"COD MW Remastered (2017)"},
{l:"mutnr91844",p:"dolus86-FunPAy",g:"TLOU 2 Remastered + more"},
{l:"youzai5144",p:"Leyouz5987",g:"Slime Rancher 2"},
{l:"xiaoshideguangmang17",p:"Sw792728",g:"Dying Light"},
{l:"ffpsw21350",p:"funpaytop_33",g:"Resident Evil Requiem"},
{l:"steamok100893",p:"steamok100885",g:"Rain World"},
{l:"genpestovy6nh41",p:"siski3623HHfkFaAz264",g:"Resident Evil Requiem"},
{l:"ragnarok_byheero",p:"https://t.me/steamaccountsog",g:"God Of War Ragnarok"},
{l:"04c4ifka",p:"marpanov",g:"Terraria"},
{l:"mylann_flashh",p:"31https://t.me/steamiq",g:"Hello Neighbor 2"},
{l:"statalalal1971",p:"8ia1uejk",g:"Stalker 2 Heart Of Chornobyl"},
{l:"iinnjj4759",p:"3dE6wjsplay",g:"RE 4 Remake + серия Resident Evil"},
{l:"adlyangel2",p:"a1b9c3wq",g:"Little Nightmares"},
{l:"pakinta",p:"www.pokopow.com",g:"TLOU Remastered, Ghost Of Tsushima"},
{l:"bababagob555",p:"027535503",g:"COD MW2 2009"},
{l:"220788844",p:"046741243",g:"Borderlands 1"},
{l:"wered171",p:"https://funpay.com/users/13462512/",g:"Outlast Trials, HL 1/2, Postal 1/2"},
{l:"joelal123",p:"Bigboss007@",g:"GTA San Andreas, GTA 5 Legacy/Enhan, ETS2, L4D2, Bus Simulator 2012, MS Flight Sim X, Transport Fever 2"},
{l:"yuchen3024",p:"zhengdacong01",g:"Mudrunner"},
{l:"gagagugu1254",p:"polpolpol09",g:"RE series, Metro, Doom, Dying Light, Hitman, Dark Souls, Witcher, Skyrim"},
{l:"miro97790405",p:"marpanov_free20",g:"RDR2"},
{l:"offl1neman",p:"P@1dbyMan",g:"Besiege, Escape the Backrooms"},
{l:"crew_utpiaplay24",p:"Gogbokonch!78",g:"Valheim, City Car Driving, Hitman 2, Metro 2033 Redux"},
{l:"xbglp85313",p:"cnkf64372Y",g:"MX Bikes"},
{l:"hros1kshopp",p:"Hros1kShop!1",g:"Hogwarts Legacy, Portal 1/2"},
{l:"xxd3m3nt0rxx",p:"3158752610E",g:"Battlefield 4 Premium Edition"},
{l:"Gf5sa4241",p:"1https://funpay.com/users/14002680/",g:"Resident Evil Requiem"},
{l:"maxiek_d",p:"ZZZZZrr1310",g:"COD Infinite Warfare"},
{l:"blue_magician_",p:"B2A2ZC656T3M",g:"Resident Evil 4"},
{l:"antonioralph1972ff",p:"0Oe!brsaxqsn2206",g:"MS Flight Simulator 2024"},
{l:"ejhd2464",p:"gnww246422",g:"Dying Light The Beast"},
{l:"gbd_dev",p:"GO2Apple2022",g:"Gas Station Simulator"},
{l:"GluttonyMorica312",p:"EFUldfejirlwyu649odj",g:"Серия Metro + DLC"},
{l:"izyd_",p:"zeyd14jst",g:"Squad"},
{l:"ruiiixx",p:"S67GBTB83D3Y",g:"Wallpaper Engine"},
{l:"qavix221",p:"playerok.com/profile/QAVIX",g:"God of War Ragnarok"},
{l:"attrth11",p:"zxc333Yaa",g:"R.E.P.O + Terraria"},
{l:"poppyxiajsh",p:"playerok.com/profile/QAVIX",g:"Poppy Playtime (все главы)"},
{l:"Dovyrth",p:"Nzkahdn97",g:"MS Flight Simulator 2020"},
{l:"xwk1998",p:"senha2019",g:"Friday the 13th"},
{l:"wbtq1085833",p:"steamok222111",g:"Assetto Corsa"},
{l:"pp29icpg",p:"RRayane66",g:"Cyberpunk 2077"},
{l:"swcmzd",p:"Sw758982",g:"Sunkenland"},
{l:"mastergamer9901",p:"supergamerscp",g:"Accident"},
{l:"lachu_figueroa",p:"Lazaro44526",g:"Серия NFS + GTA V Premium"},
{l:"qavix2231",p:"playerok.com/profile/QAVIX",g:"Teardown"},
{l:"gramlin221",p:"Mammayle1",g:"Arma 3"},
{l:"wbtq1088851",p:"steamok333",g:"Contraband Police"},
{l:"roman123817",p:"https://funpay.com/users/9873968/",g:"Scrap Mechanic"},
{l:"lhsyjq7534",p:"EXgnpov57G",g:"Rust"},
{l:"domino90904",p:"boduyashops4",g:"Granny (Classic)"},
{l:"aceventura35",p:"https://funpay.com/users/6442502/",g:"AC Syndicate + игры"},
{l:"bas_suurland@hotmail.com",p:"u4r9omZo2MW3L4J",g:"Half Life + игры, Hitman 2"},
{l:"camilo10107",p:"8F52GMZYXKS3",g:"Witcher, Mafia, Metro + игры"},
{l:"wsgln795693",p:"7LERANDR@BAW!@",g:"Mortal Kombat 11, MK X, Middle Earth"},
{l:"requiem8950",p:"Marikvolk123",g:"Stalker Shadow Of Chornobyl"},
{l:"pfzpy98380",p:"Wjuyk63519-",g:"Far Cry 3-6 + Metro"},
{l:"doona242",p:"CandyShell",g:"GTA 5 Premium"},
{l:"john_bubbles666",p:"Slipperfeet55",g:"COD Black Ops 3 + игры"},
{l:"folomon55x",p:"kolobok44884",g:"Серия Fallout"},
{l:"lady_jess1",p:"27https://t.me/steamiq",g:"COD MW3"},
{l:"onsrk052",p:"chengyu456565",g:"Accident The Pilot"},
{l:"Mariofs251",p:"Digital1813",g:"Farming Simulator 25"},
{l:"muqy37399",p:"aj6ry4y7c",g:"Grand Theft Auto V"},
{l:"swfushe4",p:"Sw654247",g:"Fallout 4 & Shelter"},
{l:"lsllu803",p:"cln354946W",g:"Don't Starve"},
{l:"amir007576609",p:"Amir00757",g:"Spintires"},
{l:"zacsef132",p:"2cool4school@",g:"Tekken 7 + Battlefield 1"},
{l:"Lkuyg12",p:"17789567Qjsu1",g:"Mafia DE + хорошая библиотека"},
{l:"caigamer_cn_re9_2",p:"caiGamer.cn",g:"Resident Evil Requiem"},
{l:"shareourlives5",p:"share_our_lives.",g:"Baldur's Gate 3"},
{l:"fernando3578546",p:"fer20082021",g:"FNAF Security Breach"},
{l:"fifj10864",p:"Rogerard7676",g:"Schedule 1"},
{l:"porlik567",p:"q3ergiuhK_41",g:"Doom Eternal, RE Requiem + more"},
{l:"danny_cjo",p:"995658364Dcjo",g:"Jurassic World Evolution 2"},
{l:"mkhh0693",p:"wxsr4347",g:"Mafia The Old Country"},
{l:"hongchen8821",p:"hongchen11523",g:"Batman Arkham City + Asylum"},
{l:"sumptuoustypolo2",p:"ZZZZZrr132",g:"Spider Man 2"},
{l:"nszbi26074",p:"exwgp64749",g:"Warhammer 40k Space Marine 2"},
{l:"precisedisadvan",p:"Nocker76*",g:"Factorio"},
{l:"brurocker",p:"bruno123",g:"Pay Day 2"},
{l:"ni9rvz0j",p:"chengyu445567",g:"Guardians of the Galaxy"},
{l:"roeor86081",p:"eowz52837B",g:"Supermarket Simulator"},
{l:"jumala_is_back",p:"9XZtDnzmp0Ms",g:"Mafia 3"},
{l:"dbqwd83332",p:"kvjvo89167",g:"Little Nightmares 3"},
{l:"ath775292",p:"UtE670214",g:"Reanimal"},
{l:"bagshototmonstra",p:"INngvjieb3423@",g:"Buckshot Roulette"},
{l:"qnlrs88225",p:"Kukimaki18",g:"Firefighting Simulator The Squad"},
{l:"bando_loves_boobs",p:"fpcandyshell123",g:"Black Myth Wukong, Clair Obscur Expedition 33"},
{l:"tanwakon",p:"30https://t.me/steamiq",g:"Naruto Ultimate Ninja Storm 4"},
{l:"qimayukanha22",p:"faffasf4554",g:"Mount & Blade 2 Bannerlord"},
{l:"Iu8Yr7Gp5Oh6",p:"Ji6Nm2Fb7Bb3",g:"COD MW3 2023"},
{l:"gggggggfsafdsa",p:"marpanov_free7",g:"Hitman Absolution"},
{l:"steamok1090206",p:"steamok888777",g:"People Playground"},
{l:"magepll",p:"marpanov_free16",g:"Metro 2033"},
{l:"igoa10919",p:"30https://t.me/steamiq",g:"F1 2024"},
{l:"seventy_qroqobgf",p:"70xplay.com",g:"Clair Obscur Expedition 33"},
{l:"oqmxt37506",p:"ushgs799funpay883",g:"Spider Man Miles Morales, Spider Man Remastered, MK 11 + AAA"},
{l:"ehtkd33230",p:"vohhe98963",g:"Crimson Desert Deluxe Edition"},
{l:"ynhtvAede2vynh",p:"siski339cwU0Q5H3wWWRvb",g:"BeamNG Drive"},
{l:"vzooy75082",p:"auodt55959",g:"Cyberpunk 2077 + хорошая библиотека"},
{l:"ecvgz63808",p:"xeujn89038",g:"Dying Light The Beast"},
{l:"pokopowadventure",p:"www.pokopow.com#8392",g:"Uncharted 4: Legacy of Thieves"},
{l:"uj5j45311",p:"FElvc5204",g:"COD MW2 2022"},
{l:"mqlfylzyhb@rambler.ru",p:"Mx2023!!9",g:"The Crew Motorfest (Ubisoft)"},
{l:"lycnk701",p:"steamok0606",g:"Postal 4 No Regerts"},
{l:"21flying",p:"Z2AKDCM3M6GZ",g:"MS Flight Sim + XPlane 12-11"},
{l:"thedrbld",p:"acc561209",g:"Dying Light 2 + хорошая библиотека"},
{l:"ivpopov13",p:"BQDhvkGfAPYh4Voqd8aco",g:"Metro Exodus + Enhanced Edition"},
{l:"beamngfpaccusedd",p:"Funpayaccusedd.",g:"BeamNG.drive"},
{l:"furkaneepro",p:"Ascarletawd3434",g:"Batman Arkham Knight, Raft + library"},
{l:"xrikm135",p:"steamok003004",g:"WWE 2K20"},
{l:"H7_is410365",p:"22https://t.me/steamiq",g:"Sleeping Dogs DE"},
{l:"gowranarokbggz7",p:"Bggz7770302#",g:"God Of War Ragnarok"},
{l:"muxj5accmp",p:"Georgian326fg",g:"Metro 2033 Redux"},
{l:"rivalchik52",p:"VADIMCHIK228",g:"RE 4 Remake, Spider Man Remastered, MK 11"},
{l:"xyjba80543",p:"god511300",g:"God Of War Ragnarok"},
{l:"4ttbs8lh",p:"https://funpay.com/users/18318680/",g:"Bodycam"},
{l:"zttsl29092",p:"chjv42725G",g:"Cyberpunk 2077"},
{l:"Puzir8081",p:"Hx@836RvMa95E",g:"Pragmata"},
{l:"tronghp1234",p:"Tronghp1232334@",g:"Black Myth Wukong"},
{l:"Qx9Tk9Nx0Ca1",p:"Pm0Ta0Zh8Wa5",g:"Days Gone + хорошая библиотека"},
{l:"xvdgfghfh",p:"aojjr17797",g:"Stalker 2"},
{l:"oiato98547",p:"wvlyn58167",g:"Crimson Desert"},
{l:"skibiditopfunpayofflineaccaynt",p:"Safs@42352jkkdfsuefdsjeh@hu!ihsd",g:"Left 4 Dead 2"},
{l:"flusstim28893",p:"https://funpay.com/users/6442502/",g:"Forza Horizon 5"},
{l:"cycxr66898",p:"Nekt0inoy",g:"Pragmata"},
{l:"frwzx76017",p:"https://funpay.com/users/16100391/",g:"Серия Metro, Crysis 3 Remastered"},
{l:"uzes79494",p:"Georgian326fg!",g:"ARC Raiders"},
{l:"ux3zc4zm5ed5",p:"miraque0*",g:"Forza Horizon 5"},
{l:"pucyhxul1809",p:"GGSEL_CopperS",g:"Hello Neighbor + хорошая библиотека"},
{l:"ForbiiiddenWest",p:"Forbidden2$4567",g:"Horizon Forbidden West"},
{l:"umuyd62770",p:"pmo090710",g:"Subnautica 2 + хорошая библиотека"},
{l:"qq280890801",p:"Qq921225",g:"Stardew Valley"},
{l:"brianrobinson8z",p:"vsnsuswmbo",g:"Brick Rigs"},
{l:"ifiqg350",p:"steamok45245235",g:"Universe Sandbox"},
{l:"ruhpz331",p:"xicxe352",g:"World Box"},
{l:"ebyvh18205",p:"azxak61276",g:"Forza Horizon 6"},
{l:"Gotfaunt",p:"L9TBc10eS1Im7di",g:"Hearts Of Iron 4"},
{l:"steamok1090064",p:"steamok200",g:"Saints Row The Third Remastered"},
{l:"yawmo27399",p:"krucv57682",g:"Subnautica 2"},
{l:"aprjq68036",p:"Nekt0fpFH6",g:"Forza Horizon 6"},
{l:"hcvrm82378",p:"%chri1218%",g:"Ghost Recon Breakpoint"},
{l:"tjbqo31217",p:"uybwx2853832A",g:"Subnautica 2"},
{l:"hqcw83331",p:"ivovasilis6456",g:"Wallpaper Engine"},
{l:"nwcnnGP43",p:"funpay-fr1zzq",g:"Forza Horizon 6"},
{l:"ujm701041",p:"TlI909452",g:"First Light 007"},
{l:"laszlovoros60",p:"pazalyhozo4688",g:"много игр"},
{l:"ydic63676",p:"HouseReady1@",g:"Ready Or Not"},
{l:"madishare11111",p:"79cBeTCpEZjABC_",g:"The Last Of Us Part 2"},
{l:"Juj22485",p:"sf757376",g:"007 First Light"},
{l:"fogmool",p:"Nutersonk43!",g:"Uncharted Legacy Of Thieves"},
{l:"asdzxc12112",p:"GaxkRrdsSB82",g:"Dark Souls 3 + игры"},
{l:"kmkaw84460",p:"33https://t.me/steamiq",g:"Escape the Backrooms"},
{l:"selfishsturgeon4899",p:"Sully!?09",g:"Mon Bazou"},
{l:"klimflain234",p:"crTf(T%yY'sN-62",g:"Meccha Chameleon"},
{l:"overfreak911",p:"yachertila",g:"много крутых игр"},
{l:"berk1158",p:"arifkaya2007",g:"Arma 3 + неплохая библиотека"},
{l:"presidentialbandicoot8056",p:"f-r-e-e-akk-tg:@hyznet",g:"Red Dead Redemption 2"},
{l:"march_2103",p:"x_plays111",g:"Серия COD"},
{l:"6raymone23",p:"BilyjDeqqC",g:"Subnautica"},
{l:"pes2019pes",p:"Pe$$ep97!",g:"Pes 2019, Pes 2016"},
{l:"rpatt27237",p:"funpayfeatherqElden",g:"Elden Ring"},
{l:"hollygordon1961",p:"acbc42b6247a41c7bfa3e88bb3e81e9b",g:"Arma Reforger"},
{l:"1353358044",p:"wangshiyao123",g:"Human Fall Flat"},
{l:"zaydd73995",p:"xvtzn66391",g:"Dead By Daylight"},
{l:"xdrmw05622",p:"cwbme10188",g:"Dying Light 2, RE 4 Remake, RE 7, MK 11, MiSide"},
{l:"tgasb88565",p:"Ffe93Gefr",g:"BeamNG + Teardown"},
{l:"kagqg46840",p:"igik8626",g:"NFS Unbound"},
{l:"bot22_2",p:"bot222RT",g:"Dark Souls Remastered"},
{l:"yghf42788",p:"Progamer@",g:"NFS Heat"},
{l:"lc4tk0bn9fs5",p:"Polopolo9",g:"Euro Truck Simulator 2"},
{l:"wn61CUFy",p:"ng20QBGP",g:"Project Zomboid"},
{l:"jadalilgarcia",p:"sk8erboi8",g:"Skyrim"},
{l:"m0rfisftw",p:"6619264692Morfis",g:"Just Cause 3"},
{l:"moteenhoiki",p:"Dj3JOO3fjRVtR67",g:"City Car Driving"},
{l:"kauoy17421",p:"esqa74870W",g:"Split Fiction"},
{l:"wbtq1085903",p:"steamok35664Y",g:"No Man's Sky"},
{l:"supercraft_yt1",p:"11025029q",g:"Wallpaper Engine, DBD, Black Squad, Crab Game, Unturned"},
{l:"matysek_xd0",p:"tunta123",g:"Doom (2016)"},
{l:"awaki_ln",p:"Lenny1209",g:"Meccha Chameleon, GTA 5 Enhanced, Among Us"},
{l:"liujunjie123413",p:"liujunjie12A",g:"Black Myth Wukong, RE 4 Remake, RE Village, Mafia 2 DE, Mafia DE, Tomb Raider, Batman Arkham Knight, Ведьмак 3, Metro Exodus, Control, Bioshock"},
{l:"SkizeGames52745RE95",p:"www.skizegames.store",g:"Resident Evil 9 Requiem"},
{l:"stimgamerfarmingsymulator2017",p:"steamgamer321fs!2017",g:"FS 17, Spin Tires, Stable Guys"},
{l:"janschumandl",p:"135642qqabc",g:"AC Origins, Hitman 2, Terraria"},
{l:"yappydoor01337",p:"d{E}dsvvrb$~0tJ",g:"Geometry Dash, ETS2, Among Us, Garry's Mod, HOI4, Hello Neighbor, Undertale, Terraria, Dying Light"},
{l:"avtoritet118",p:"KSGG8EE76DB9",g:"COD MW3 2011"},
{l:"Fi7Ft7Sf5Dt4",p:"Wr2Lr8Xh1Qj4",g:"Naruto Ultimate Ninja Storm 4, Baldi's Basics"},
{l:"aguilaryamir207",p:"Wargames12",g:"Lego Ninjago Movie Videogame"},
{l:"streetyain",p:"str2n11..1",g:"Detroit, RDR2, Ведьмак 3, GTA 5 Enhanced, Mafia DE"},
{l:"relevantquokka64991",p:"h3it1vyzc8ipkc7!wgewz",g:"The Hunter Call Of The Wild"},
{l:"jbtxk48975",p:"saeed_7404",g:"Ghost Recon Breakpoint, ETS2"},
{l:"zazaxe4",p:"37191610z",g:"FS 19, Pacify, ETS2"},
{l:"mortalkombat11sharing",p:"mortalkombat112019",g:"Mortal Kombat 11"},
{l:"lsoiy210",p:"lwl67033R",g:"Snow Runner, L4D2, Rust"},
{l:"tczfy83308",p:"HE1092618",g:"Mud Runner, Cities Skylines, SnowRunner, ETS2, L4D2, The Forest, Stardew Valley, Borderlands 2, Terraria, Car Mechanic Sim, Battlefield 1, Green Hell"},
{l:"supersuper61",p:"coelho2015",g:"Arma 2, L4D2"},
{l:"bcaxo55681",p:"noyyb36531",g:"007 First Light, Forza Horizon 6, Lego Batman Legacy Of Dark Knight"},
{l:"ofyxw04053",p:"uixay83374",g:"NBA 2K26, Skate"},
{l:"ydtdo32097",p:"PzIf3P1GXw2dEJ",g:"Meccha Chameleon"},
{l:"anthonykelly1972",p:"TovarStore123",g:"R.E.P.O"},
{l:"wbtq1083464",p:"steamok45785112",g:"The Forest, Among Us"},
{l:"toto121aktiva",p:"afkaweo9312jfia0",g:"Cyberpunk 2077, Mafia The Old Country, TLOU Remastered, Forza Horizon 4, Schedule 1, Sons Of The Forest, HOI4, RE 4 Remake, RE 2 Remake, Outlast, Days Gone, Mafia trilogy, Metro, God Of War 2018, Detroit, Stalker, Ведьмак 3, Dying Light, Pay Day 2, ETS2"},
{l:"SkizeGames13801MK1",p:"www.skizegames.store",g:"MK 1, MK 11, MK X"},
{l:"s6242xmx",p:"IZNnSgUjrbdK",g:"Bodycam, DBD, Dead Island 2"},
{l:"jollyrojer919",p:"offlineactivator919",g:"Horizon Zero Dawn Complete Edition"},
{l:"kostagjorcepetrov",p:"marpanov_free15",g:"GTA 5 Enhanced, GTA 5 Legacy"},
{l:"steamok1089916",p:"steamok765567",g:"Trailmakers"},
{l:"wbtq1086053",p:"steamok987789",g:"The Binding Of Isaac Rebirth"},
{l:"codl39195",p:"Pt5Ac2Fu8Yf66t",g:"Subnautica 2"},
{l:"seventy_echowfio",p:"70xplay.com",g:"Clair Obscur Expedition 33"},
{l:"rkchj843930",p:"DaCpS071124",g:"Peak"},
{l:"hxsyp47527",p:"prlqw30923",g:"No, I'm Not a Human"},
{l:"bpzksitv1580",p:"5511765MMhh",g:"Resident Evil 2"},
{l:"popoaleksey1",p:"iVlGER8l",g:"Resident Evil 3"},
{l:"mahdeeis",p:"mahdi07819966920",g:"MK X + 19 игр"},
{l:"johnlopez217",p:"funpayChainz96",g:"Spider Man Remastered + Miles Morales, GTA 5, 7 Days To Die, Witcher 3, Batman, Forza Horizon 4/5, God of War, Hitman, Injustice 2, Payday 2, Sifu, Sleeping Dogs, Hogwarts Legacy"},
{l:"abc00368",p:"358462377Tjc",g:"Cyberpunk 2077, BG3, Black Myth Wukong, Forza Horizon 4 и много других"},
{l:"uwvehewx",p:"acqczzkv6Zrt",g:"Ведьмак 3, Alien Isolation, Batman серия, Resident Evil 2/3/4/5/6/7/8, Outlast, Mortal Kombat, Mafia trilogy, Metro, Tomb Rider, Robocop, Hogwarts Legacy"},
{l:"trnb2u4px",p:"qTkFA5498PUgrWZYHK KKg0xvKyzVNs6y",g:"Mortal Kombat X, Hitman 2"},
{l:"socialpidar",p:"Kirito11_uz09",g:"Ведьмак 3, Age of History II, Assetto Corsa, Detroit, The Forest, ETS2, Forza Horizon 4/5, HOI4, L4D2, Mafia, Metro, My Summer Car, Naruto, Ride 4, Schedule I, Scrap Mechanic"},
{l:"accinator4000",p:"hol_kni_sil",g:"Ведька 3, ARK, Binding of Isaac, Borderlands 2, Cult the Lamb, Cuphead, Cyberpunk 2077, Darkest Dungeon, Dead Cells, DST, Fallout 4, The Forest, Ghostrunner, Hades, HL2, Hollow Knight, Silksong, Hotline Miami 2, Kena, LEGO Star Wars, Magica, MH World, MK 11, Plants vs Zombie, Portal 1/2, Shovel Knight, Spiritfarer, Stardew Valley, Subnautica, Super Meat Boy, Terraria, Undertale, Vampire Survival, Worms W.M.D, Hogwarts Legacy"},
{l:"fendtking",p:"johndeere6215r",g:"Sons Of The Forest, Watch Dogs Legion"},
{l:"gcbio11345",p:"5fgPp49YSq0R",g:"Just Cause 4"},
{l:"08520014",p:"yanzheng1125",g:"Ready Or Not"},
{l:"fnapes12",p:"Standoff113",g:"Kenshi, Toy Tinker, Payday 2, Green Hell, Warhammer, Ranch Sim, Hobo, Baldi's Basics, Spacewar, Metro Exodus, Spore, Getting Over It, Metro Last Light, L4D2, Sniper Elite 4/5, Stardew Valley, Borderlands 2, Euro Truck Sim 2, Dying Light, Witcher 3, The Forest, Far Cry 3/4/5, BeamNG, Buckshot Roulette"},
{l:"wsqfu308",p:"steamok003004",g:"City Car Driving"},
{l:"HDVLI42373",p:"jijing11010",g:"Silent Hill 2"},
{l:"Qo6Su4Ij6Qg4",p:"?lgjDd!$yS10H%",g:"FC 25"},
{l:"jalmond111",p:"112233332211Ja",g:"Rust"},
{l:"dionildo3",p:"Dhodho23",g:"Mudrunner, ETS2, GTA 5"},
{l:"suklpj4gy",p:"Hh603951ac",g:"Horizon Zero Dawn"},
{l:"mafia_phasmavpn",p:"qQWERTY33!",g:"Mafia The Old Country"},
{l:"xxl_deknky",p:"FF4CBEGXTX9K",g:"BeamNG.drive"},
{l:"hdpxu36706",p:"mnvqu33267",g:"Spider Man Miles Morales + игры на фото"},
{l:"davemullins90",p:"9wnrv35n3h",g:"It Takes Two"},
{l:"chief_aaj",p:"z0y6mJImiW9kU",g:"Teardown, GTA 5"},
{l:"dvtlv0nmkl",p:"YSDI0C0kgE",g:"COD Black Ops 3"},
{l:"red1284829",p:"V1_mgHNyRh$8",g:"Ultrakill, Half Life"},
{l:"tyypv07695",p:"WvbFGG456DV",g:"R.E.P.O"},
{l:"HDVLI42373",p:"jijing11010",g:"Silent Hill 2"},
];

// ============================================================
// HTML
// ============================================================
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Steam Checker</title>
<style>
:root{--bg:#050508;--surface:rgba(12,12,18,.6);--border:rgba(255,255,255,.06);--text:#e8e8f0;--text-muted:#6b6b7d;--accent:#00d4ff;--accent-glow:rgba(0,212,255,.4);--ok:#00ff9d;--err:#ff3366;--warn:#ffb800}
*{box-sizing:border-box}
body{margin:0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);background-image:radial-gradient(ellipse 80% 50% at 50% -20%,rgba(0,212,255,.08),transparent),radial-gradient(ellipse 60% 50% at 50% 120%,rgba(0,255,157,.04),transparent),var(--bg);color:var(--text);display:flex;justify-content:center;align-items:flex-start;min-height:100vh;padding:40px 20px}
.container{background:var(--surface);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);padding:2.5rem;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.05);width:100%;max-width:700px;position:relative;animation:slideUp .6s cubic-bezier(.16,1,.3,1)}
.container::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,212,255,.3),transparent)}
.lang-switcher{position:absolute;top:1.5rem;right:1.5rem;display:flex;gap:4px;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:8px;padding:2px}
.lang-btn{background:transparent;border:none;color:var(--text-muted);font-size:.75rem;font-weight:700;padding:6px 10px;border-radius:6px;cursor:pointer;transition:all .2s;font-family:inherit}
.lang-btn.active{background:rgba(0,212,255,.1);color:var(--accent)}
.lang-btn:hover:not(.active){color:var(--text)}
.head{display:flex;justify-content:center;align-items:center;margin-bottom:2rem}
.logo{font-size:1.2rem;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--text);display:flex;align-items:center;gap:10px}
.logo::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 12px var(--accent),0 0 24px var(--accent-glow);animation:pulse 2.5s infinite}
.nav-tabs{display:flex;gap:4px;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:12px;padding:4px;margin-bottom:2rem}
.nav-tab{flex:1;padding:12px;text-align:center;font-size:.85rem;font-weight:600;color:var(--text-muted);border-radius:8px;cursor:pointer;transition:all .3s;letter-spacing:.5px}
.nav-tab.active{background:rgba(0,212,255,.08);color:var(--accent);box-shadow:inset 0 0 0 1px rgba(0,212,255,.2),0 0 20px rgba(0,212,255,.08)}
.nav-tab:hover:not(.active){color:var(--text)}
.view-section{display:none}
.view-section.active{display:block;animation:fadeIn .4s}
.section-header{text-align:center;margin-bottom:1.5rem}
.section-header h2{margin:0 0 .5rem 0;font-size:1rem;font-weight:600;color:var(--text)}
.section-header p{margin:0;color:var(--text-muted);font-size:.85rem}
.field{margin-bottom:1rem;position:relative}
.field label{display:block;font-size:.75rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;font-weight:600}
.field input{width:100%;padding:14px 16px;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.95rem;font-family:inherit;outline:none;transition:all .3s}
.field input::placeholder{color:var(--text-muted);font-size:.9rem}
.field input:focus{border-color:rgba(0,212,255,.4);box-shadow:0 0 0 3px rgba(0,212,255,.08),0 0 20px rgba(0,212,255,.1);background:rgba(0,0,0,.5)}
.btn{width:100%;padding:14px;margin-top:.5rem;background:transparent;border:1px solid rgba(0,212,255,.3);border-radius:10px;color:var(--accent);font-size:.85rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .3s;position:relative;overflow:hidden;font-family:inherit}
.btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,212,255,.1),rgba(0,212,255,.02));opacity:0;transition:opacity .3s}
.btn:hover::before{opacity:1}
.btn:hover{border-color:rgba(0,212,255,.6);box-shadow:0 0 24px rgba(0,212,255,.15)}
.btn:active{transform:scale(.98)}
.btn:disabled{opacity:.4;cursor:not-allowed;border-color:var(--border);color:var(--text-muted)}
.result{margin-top:1.5rem;padding:14px;border-radius:10px;font-size:.85rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;text-align:center;display:none;animation:popIn .4s}
.result.show{display:block}
.result.ok{background:rgba(0,255,157,.05);border:1px solid rgba(0,255,157,.2);color:var(--ok);box-shadow:0 0 24px rgba(0,255,157,.08)}
.result.err{background:rgba(255,51,102,.05);border:1px solid rgba(255,51,102,.2);color:var(--err);box-shadow:0 0 24px rgba(255,51,102,.08)}
.result.warn{background:rgba(255,184,0,.05);border:1px solid rgba(255,184,0,.2);color:var(--warn);text-transform:none;letter-spacing:.5px;font-weight:500}
.captcha-box{margin-top:1.5rem;padding:1.5rem;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:12px;display:none}
.captcha-box.show{display:block;animation:fadeIn .4s}
.captcha-box img{width:100%;border-radius:8px;margin-bottom:12px;background:#fff}
.bypass-list{display:flex;flex-direction:column;gap:12px}
.bypass-btn{display:flex;align-items:center;gap:14px;padding:16px;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:12px;color:var(--text);text-decoration:none;font-weight:600;font-size:.95rem;transition:all .3s}
.bypass-btn:hover{border-color:var(--accent);background:rgba(0,212,255,.05);box-shadow:0 0 20px rgba(0,212,255,.1);transform:translateY(-2px)}
.bypass-btn svg{width:20px;height:20px;color:var(--accent);flex-shrink:0}
/* Accounts tab */
.search-wrap{margin-bottom:1.2rem;position:relative}
.search-wrap input{width:100%;padding:14px 16px 14px 44px;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.95rem;font-family:inherit;outline:none;transition:all .3s}
.search-wrap input:focus{border-color:rgba(0,212,255,.4);box-shadow:0 0 0 3px rgba(0,212,255,.08)}
.search-wrap::before{content:'🔍';position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:1rem;pointer-events:none}
.accounts-info{font-size:.75rem;color:var(--text-muted);margin-bottom:.8rem;text-align:center;letter-spacing:1px;text-transform:uppercase}
.accounts-list{display:flex;flex-direction:column;gap:10px;max-height:600px;overflow-y:auto;padding-right:6px}
.accounts-list::-webkit-scrollbar{width:6px}
.accounts-list::-webkit-scrollbar-track{background:rgba(0,0,0,.2);border-radius:3px}
.accounts-list::-webkit-scrollbar-thumb{background:rgba(0,212,255,.3);border-radius:3px}
.acc-card{background:rgba(0,0,0,.35);border:1px solid var(--border);border-radius:12px;padding:14px 16px;transition:all .25s;position:relative}
.acc-card:hover{border-color:rgba(0,212,255,.3);background:rgba(0,212,255,.03);box-shadow:0 0 20px rgba(0,212,255,.06)}
.acc-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.acc-label{font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1.2px;min-width:52px;font-weight:700}
.acc-value{font-family:ui-monospace,'Cascadia Code',monospace;font-size:.88rem;color:var(--text);word-break:break-all;flex:1}
.acc-copy{background:transparent;border:1px solid var(--border);color:var(--text-muted);border-radius:6px;padding:4px 8px;font-size:.7rem;cursor:pointer;transition:all .2s;font-family:inherit;flex-shrink:0}
.acc-copy:hover{border-color:var(--accent);color:var(--accent);background:rgba(0,212,255,.08)}
.acc-copy.done{color:var(--ok);border-color:rgba(0,255,157,.4);background:rgba(0,255,157,.08)}
.acc-games{margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,255,255,.05);font-size:.78rem;color:var(--text-muted);line-height:1.5}
.acc-games strong{color:var(--text);font-weight:600}
.empty{padding:30px;text-align:center;color:var(--text-muted);font-size:.9rem}
@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(0,212,255,.4)}70%{box-shadow:0 0 0 6px rgba(0,212,255,0)}100%{box-shadow:0 0 0 0 rgba(0,212,255,0)}}
</style>
</head>
<body>
<div class="container">
<div class="lang-switcher">
<button class="lang-btn" data-lang="ru" onclick="setLanguage('ru')">RU</button>
<button class="lang-btn" data-lang="en" onclick="setLanguage('en')">EN</button>
</div>
<div class="head"><div class="logo" data-i18n="title">Steam Checker</div></div>

<div class="nav-tabs">
<div class="nav-tab active" data-view="checker" data-i18n="tabChecker">Проверка</div>
<div class="nav-tab" data-view="accounts" data-i18n="tabAccounts">Аккаунты</div>
<div class="nav-tab" data-view="bypass" data-i18n="tabBypass">Обходы</div>
</div>

<div id="checkerView" class="view-section active">
<div class="section-header">
<h2 data-i18n="authCheckTitle">Проверка аккаунта</h2>
<p data-i18n="authCheckDesc">Введите данные для проверки</p>
</div>
<div class="field">
<label data-i18n="labelLogin">Логин</label>
<input type="text" id="username" placeholder="steam логин" autocomplete="off">
</div>
<div class="field">
<label data-i18n="labelPassword">Пароль</label>
<input type="password" id="password" placeholder="••••••••">
</div>
<button class="btn" id="checkBtn" data-i18n="btnCheck">Проверить</button>
<div class="captcha-box" id="captchaBox">
<img id="captchaImage" alt="CAPTCHA">
<div class="field" style="margin-bottom:10px">
<input type="text" id="captchaText" placeholder="Введите код">
</div>
<button class="btn" id="captchaBtn" style="border-color:rgba(255,184,0,.3);color:var(--warn)" data-i18n="btnCaptcha">Отправить</button>
</div>
<div class="result" id="result"></div>
</div>

<div id="accountsView" class="view-section">
<div class="section-header">
<h2 data-i18n="accountsTitle">Общие аккаунты</h2>
<p data-i18n="accountsDesc">Аккаунты из архива канала</p>
</div>
<div class="search-wrap">
<input type="text" id="searchInput" placeholder="Поиск по игре или логину...">
</div>
<div class="accounts-info" id="accountsInfo"></div>
<div class="accounts-list" id="accountsList"></div>
</div>

<div id="bypassView" class="view-section">
<div class="section-header">
<h2 data-i18n="bypassTitle">Обходы лаунчеров</h2>
<p data-i18n="bypassDesc">Инструменты для обхода защиты</p>
</div>
<div class="bypass-list">
<a href="https://github.com/onajlikezz/Nightlight-Launcher/releases/download/NLLauncherV5.3.00/Nightlight.Launcher.Setup.5.3.0.exe" class="bypass-btn" target="_blank">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
<span>Обход Rockstar Launcher</span>
</a>
<a href="https://github.com/LightnigFast/Project-Lightning/releases/download/v5.0.11.0/ProjectLightningInstaller-v5.exe" class="bypass-btn" target="_blank">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
<span>Универсальный обход</span>
</a>
</div>
</div>
</div>

<script>
const SHARED_ACCOUNTS = __SHARED_ACCOUNTS__;

const translations = {
ru:{title:"Steam Checker",tabChecker:"Проверка",tabAccounts:"Аккаунты",tabBypass:"Обходы",authCheckTitle:"Проверка аккаунта",authCheckDesc:"Введите данные для проверки",labelLogin:"Логин",labelPassword:"Пароль",btnCheck:"Проверить",btnCaptcha:"Отправить",errFill:"Заполните все поля",errCaptcha:"Введите код капчи",warnCaptcha:"Требуется капча",warnCaptchaWrong:"Неверная капча",errNetwork:"Ошибка сети",okAccount:"Аккаунт работает",errAccount:"Аккаунт не работает",bypassTitle:"Обходы лаунчеров",bypassDesc:"Инструменты для обхода защиты",accountsTitle:"Общие аккаунты",accountsDesc:"Аккаунты из архива канала",wait:"Подождите",checking:"Проверка...",found:"Найдено",acc:"аккаунтов",copy:"Копировать",copied:"OK!",games:"Игры",login:"Логин",pass:"Пароль",noResults:"Ничего не найдено"},
en:{title:"Steam Checker",tabChecker:"Checker",tabAccounts:"Accounts",tabBypass:"Bypass",authCheckTitle:"Account Check",authCheckDesc:"Enter credentials to verify",labelLogin:"Login",labelPassword:"Password",btnCheck:"Check",btnCaptcha:"Submit",errFill:"Fill in all fields",errCaptcha:"Enter captcha code",warnCaptcha:"Captcha required",warnCaptchaWrong:"Wrong captcha",errNetwork:"Network error",okAccount:"Account works",errAccount:"Account does not work",bypassTitle:"Launcher Bypass",bypassDesc:"Tools to bypass protection",accountsTitle:"Shared Accounts",accountsDesc:"Accounts from channel archive",wait:"Wait",checking:"Checking...",found:"Found",acc:"accounts",copy:"Copy",copied:"OK!",games:"Games",login:"Login",pass:"Password",noResults:"Nothing found"}
};

let currentLang = localStorage.getItem('lang') || 'ru';

function setLanguage(lang){
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if(translations[lang][k]) el.textContent = translations[lang][k];
    });
    renderAccounts();
}

setLanguage(currentLang);

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.view + 'View').classList.add('active');
    });
});

let captchaGid = '-1';
let cooldownTimer = null;
const COOLDOWN = 15;

function startCooldown(){
    const btn = document.getElementById('checkBtn');
    const t = translations[currentLang];
    let remaining = COOLDOWN;
    btn.disabled = true;
    btn.textContent = t.wait + ' ' + remaining + 's';
    if(cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(() => {
        remaining--;
        if(remaining <= 0){ clearInterval(cooldownTimer); cooldownTimer = null; btn.disabled = false; btn.textContent = t.btnCheck; }
        else btn.textContent = t.wait + ' ' + remaining + 's';
    }, 1000);
}

function showResult(type, text){
    const res = document.getElementById('result');
    res.className = 'result show ' + type;
    if(text) res.textContent = text;
    else{
        const t = translations[currentLang];
        res.textContent = type === 'ok' ? t.okAccount : (type === 'warn' ? t.warnCaptcha : t.errAccount);
    }
}

async function doCheck(login, pass, gid, text){
    try{
        const r = await fetch('/check', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:login,password:pass,captcha_gid:gid,captcha_text:text})});
        return await r.json();
    }catch(e){ return {status:'error', message:translations[currentLang].errNetwork}; }
}

document.getElementById('checkBtn').addEventListener('click', async () => {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    const t = translations[currentLang];
    if(!u || !p){ showResult('err', t.errFill); return; }
    const btn = document.getElementById('checkBtn');
    btn.disabled = true; btn.textContent = t.checking;
    document.getElementById('result').classList.remove('show');
    document.getElementById('captchaBox').classList.remove('show');
    const data = await doCheck(u, p, '-1', '');
    if(data.status === 'captcha'){
        captchaGid = data.captcha_gid;
        document.getElementById('captchaImage').src = '/api/captcha/' + captchaGid;
        document.getElementById('captchaBox').classList.add('show');
        showResult('warn', t.warnCaptcha);
    }else if(data.status === 'success') showResult('ok', t.okAccount);
    else showResult('err', t.errAccount);
    btn.disabled = false; btn.textContent = t.btnCheck;
    startCooldown();
});

document.getElementById('captchaBtn').addEventListener('click', async () => {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    const t = document.getElementById('captchaText').value.trim();
    const lang = translations[currentLang];
    if(!t){ showResult('err', lang.errCaptcha); return; }
    const btn = document.getElementById('captchaBtn');
    btn.disabled = true; btn.textContent = lang.checking;
    const data = await doCheck(u, p, captchaGid, t);
    if(data.status === 'captcha'){
        document.getElementById('captchaImage').src = '/api/captcha/' + data.captcha_gid + '?t=' + Date.now();
        captchaGid = data.captcha_gid;
        document.getElementById('captchaText').value = '';
        showResult('warn', lang.warnCaptchaWrong);
    }else if(data.status === 'success'){
        document.getElementById('captchaBox').classList.remove('show');
        showResult('ok', lang.okAccount);
    }else{
        document.getElementById('captchaBox').classList.remove('show');
        showResult('err', lang.errAccount);
    }
    btn.disabled = false; btn.textContent = lang.btnCaptcha;
    startCooldown();
});

// === ACCOUNTS TAB ===
function copyText(text, btn){
    const done = () => {
        const orig = btn.textContent;
        btn.textContent = translations[currentLang].copied;
        btn.classList.add('done');
        setTimeout(() => { btn.textContent = orig; btn.classList.remove('done'); }, 1200);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
}

function fallbackCopy(text, cb){
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); cb(); } catch(e) {}
    document.body.removeChild(ta);
}

function renderAccounts(){
    const t = translations[currentLang];
    const query = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    const list = document.getElementById('accountsList');
    const info = document.getElementById('accountsInfo');
    const filtered = !query ? SHARED_ACCOUNTS : SHARED_ACCOUNTS.filter(a =>
        a.l.toLowerCase().includes(query) || a.g.toLowerCase().includes(query)
    );
    info.textContent = t.found + ': ' + filtered.length + ' ' + t.acc;
    if(filtered.length === 0){
        list.innerHTML = '<div class="empty">' + t.noResults + '</div>';
        return;
    }
    const frag = document.createDocumentFragment();
    filtered.forEach((acc, idx) => {
        const card = document.createElement('div');
        card.className = 'acc-card';

        const rowL = document.createElement('div');
        rowL.className = 'acc-row';
        const lblL = document.createElement('span');
        lblL.className = 'acc-label'; lblL.textContent = t.login;
        const valL = document.createElement('span');
        valL.className = 'acc-value'; valL.textContent = acc.l;
        const btnL = document.createElement('button');
        btnL.className = 'acc-copy'; btnL.textContent = t.copy;
        btnL.addEventListener('click', () => copyText(acc.l, btnL));
        rowL.appendChild(lblL); rowL.appendChild(valL); rowL.appendChild(btnL);

        const rowP = document.createElement('div');
        rowP.className = 'acc-row';
        const lblP = document.createElement('span');
        lblP.className = 'acc-label'; lblP.textContent = t.pass;
        const valP = document.createElement('span');
        valP.className = 'acc-value'; valP.textContent = acc.p;
        const btnP = document.createElement('button');
        btnP.className = 'acc-copy'; btnP.textContent = t.copy;
        btnP.addEventListener('click', () => copyText(acc.p, btnP));
        rowP.appendChild(lblP); rowP.appendChild(valP); rowP.appendChild(btnP);

        const games = document.createElement('div');
        games.className = 'acc-games';
        const gStrong = document.createElement('strong');
        gStrong.textContent = t.games + ': ';
        games.appendChild(gStrong);
        games.appendChild(document.createTextNode(acc.g));

        card.appendChild(rowL);
        card.appendChild(rowP);
        card.appendChild(games);
        frag.appendChild(card);
    });
    list.innerHTML = '';
    list.appendChild(frag);
}

document.getElementById('searchInput').addEventListener('input', renderAccounts);
renderAccounts();

// === PING ===
let sid = sessionStorage.getItem('sid');
if(!sid){ sid = Math.random().toString(36).substring(2, 15); sessionStorage.setItem('sid', sid); }
function ping(){ fetch('/ping', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:sid})}).catch(()=>{}); }
setInterval(ping, 10000); ping();
</script>
</body>
</html>`;

// Inject accounts data safely
const HTML_FINAL = HTML_TEMPLATE.replace('__SHARED_ACCOUNTS__', JSON.stringify(SHARED_ACCOUNTS));

// ============================================================
// Steam RSA + login
// ============================================================
function buildRSAPublicKeyPEM(modHex, expHex){
    const modBuf = Buffer.from(modHex, 'hex');
    const expBuf = Buffer.from(expHex, 'hex');
    function derLength(len){ if(len<128) return Buffer.from([len]); const b=[]; let l=len; while(l>0){b.unshift(l&0xff);l>>=8;} return Buffer.from([0x80|b.length,...b]); }
    function derTag(tag, content){ return Buffer.concat([Buffer.from([tag]), derLength(content.length), content]); }
    function derInteger(buf){ if(buf.length>0 && (buf[0]&0x80)) buf = Buffer.concat([Buffer.from([0x00]),buf]); return derTag(0x02, buf); }
    function derSequence(items){ return derTag(0x30, Buffer.concat(items)); }
    function derBitString(content){ return derTag(0x03, Buffer.concat([Buffer.from([0x00]),content])); }
    function derOid(oid){ return derTag(0x06, oid); }
    function derNull(){ return Buffer.from([0x05,0x00]); }
    const rsaPublicKey = derSequence([derInteger(modBuf), derInteger(expBuf)]);
    const algorithmIdentifier = derSequence([derOid(Buffer.from([0x2a,0x86,0x48,0x86,0xf7,0x0d,0x01,0x01,0x01])), derNull()]);
    const subjectPublicKeyInfo = derSequence([algorithmIdentifier, derBitString(rsaPublicKey)]);
    const b64 = subjectPublicKeyInfo.toString('base64');
    return `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
}

async function checkSteamCredentials(username, password, captchaGid = '-1', captchaText = ''){
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://steamcommunity.com/login/home/?goto=',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://steamcommunity.com',
        'X-Requested-With': 'XMLHttpRequest'
    };
    let rsaData, sessionCookies = '';
    try{
        const rsaResponse = await axios.get('https://steamcommunity.com/login/getrsakey', {params:{username},headers,timeout:10000});
        rsaData = rsaResponse.data;
        if(rsaResponse.headers['set-cookie']) sessionCookies = rsaResponse.headers['set-cookie'].map(c=>c.split(';')[0]).join('; ');
    }catch(e){ return {status:'error',message:'Аккаунт не работает'}; }
    if(!rsaData.success) return {status:'error',message:'Аккаунт не работает'};

    let encryptedPasswordB64;
    try{
        const publicKeyPem = buildRSAPublicKeyPEM(rsaData.publickey_mod, rsaData.publickey_exp);
        const encrypted = crypto.publicEncrypt({key:publicKeyPem, padding:crypto.constants.RSA_PKCS1_PADDING}, Buffer.from(password,'utf-8'));
        encryptedPasswordB64 = encrypted.toString('base64');
    }catch(e){ return {status:'error',message:'Аккаунт не работает'}; }

    const payload = new URLSearchParams({
        username, password: encryptedPasswordB64, twofactorcode:'', emailauth:'', loginfriendlyname:'',
        captchagid: captchaGid, captcha_text: captchaText, emailsteamid:'', rsatimestamp: rsaData.timestamp,
        remember_login:'false', donotcache: Date.now().toString()
    });

    const loginHeaders = {...headers, 'Content-Type':'application/x-www-form-urlencoded'};
    if(sessionCookies) loginHeaders['Cookie'] = sessionCookies;

    let loginData;
    try{
        const loginResponse = await axios.post('https://steamcommunity.com/login/dologin/', payload.toString(), {headers:loginHeaders,timeout:10000});
        loginData = loginResponse.data;
    }catch(e){ return {status:'error',message:'Аккаунт не работает'}; }

    if(loginData.success) return {status:'success',message:'Аккаунт работает'};
    if(loginData.captcha_needed) return {status:'captcha',message:'Требуется капча',captcha_gid: loginData.captcha_gid || '-1'};
    return {status:'error',message:'Аккаунт не работает'};
}

// ============================================================
// Routes
// ============================================================
app.get('/', (req, res) => res.send(HTML_FINAL));

app.get('/api/captcha/:gid', async (req, res) => {
    try{
        const response = await axios.get(`https://steamcommunity.com/login/rendercaptcha/?gid=${req.params.gid}`, {
            responseType:'arraybuffer',
            headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'},
            timeout:10000
        });
        res.set('Content-Type','image/jpeg');
        res.send(response.data);
    }catch(e){ res.status(500).send('Ошибка загрузки капчи'); }
});

app.post('/ping', (req, res) => {
    if(req.body.sessionId) activeSessions.set(req.body.sessionId, Date.now());
    res.json({ok:true});
});

app.get('/stats', (req, res) => res.json({online: activeSessions.size}));

app.post('/check', async (req, res) => {
    const {username, password, captcha_gid, captcha_text} = req.body;
    if(!username || !password) return res.json({status:'error',message:'Аккаунт не работает'});
    const result = await checkSteamCredentials(username.trim(), password.trim(), captcha_gid || '-1', captcha_text || '');
    res.json(result);
});

app.listen(PORT, '0.0.0.0', () => console.log(`Сервер запущен на порту ${PORT}`));
