fn main() -> Result<(), Box<dyn std::error::Error>> {
  if cfg!(target_os = "windows") {
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
      .set("Comments", "i am a teapot")
      .set("InternalName", "2+2 IS 4 MINUS 1 DAS 3 QUICK MATHS")
      .set_version_info(winres::VersionInfo::PRODUCTVERSION, 0x0001000000000000);
    res.compile()?;
  }
  Ok(())
}
