use rand::Rng;
fn main() -> Result<(), Box<dyn std::error::Error>> {
  if cfg!(target_os = "windows") {
    let mut rng = rand::thread_rng();
    let memes = vec![
      "2+2 IS 4 MINUS 1 DAS 3 QUICK MATHS",
      "HTTP 418",
      "I am a Teapot",
      "i use arch, btw",
      "i use gentoo, btw",
      "i play video games on a toasterbath-pc, btw",
      "#fuckcopycats",
      "727 when you fucking see it",
      "I can haz cheezborgar?",
      "CheezboRGar?",
      "*slap* ah fuck, i can't believe you've done this",
      "legalize nuclear bombs",
      "Never gonna give you up",
      "do u kno da wae?",
      "i'm going to surgery a coca cola can",
      "the short form of frog sticker is fricker",
      "HOLYH UFKICNG SHIT !@!!!#! IS TAHTG A JOSJO REFERERECENEE?!?!??!",
      "teapot",
      "u should kill urself now!! ur life is worth nothing!! u serve 0 purpose!!!",
      "fifty ten hull in french",
      "deepfried pizza",
    ];
    let mut res = winres::WindowsResource::new();
    res
      .set_icon("animegirl.ico")
      .set("InternalName", "RCO3Launcher.exe")
      .set(
        "FileDescription",
        "Launches RCO3's index.js using NodeJS - Yup, that's all",
      )
      .set("ProductName", "RCO3Launcher")
      .set("OriginalFilename", "RCO3Launcher.exe")
      .set("LegalCopyright", "Copyright (c) 2023 Expo, Kaede & L8X")
      .set("Comments", memes[rng.gen_range(0..memes.len())])
      .set("InternalName", memes[rng.gen_range(0..memes.len())])
      .set_version_info(winres::VersionInfo::PRODUCTVERSION, 0x0001000000000000);
    res.compile()?;
  }
  Ok(())
}
