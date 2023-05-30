use std::fs::{self};
use std::io::{self, Write};
use std::os::windows::fs::symlink_dir;
use std::path::{Path, PathBuf};

fn pause() {
  print!("Press enter to exit...");
  io::stdout().flush().unwrap();
  io::stdin().read_line(&mut String::new()).unwrap();
}

fn symlink_roblox() {
  println!("Creating Paths");
  let src = Path::new("C:\\Program Files (x86)\\Roblox");
  let dst = PathBuf::from(std::env::var("LOCALAPPDATA").unwrap() + "\\Roblox");

  println!("Checking if PFRBX exists");
  if !(src.exists() && src.is_dir()) {
    println!("Program files x86 -> Roblox does not exist! No work needed.");
    // pause();
    return;
  }

  println!("Checking if PFRBX is a symlink");
  if let Ok(metadata) = fs::symlink_metadata(src) {
    if metadata.file_type().is_symlink() {
      println!("Source directory is already symlinked!");
      // pause();
      return;
    }
  }

  println!("Moving");
  fs::rename(src, &dst);
  symlink_dir(&dst, src);

  println!("Setting up Permissions");
  let metadata = fs::metadata(&dst);
  let permissions = metadata.unwrap().permissions();
  fs::set_permissions(src, permissions);

  println!("Moved Roblox to LocalAppData!");
}

fn remove_rco2() {
  let path = "C:\\Program Files (x86)\\RCO2";
  if let Err(e) = fs::remove_dir_all(path) {
    println!("Error: {:?}", e);
    pause();
  } else {
    println!("Directory removed successfully.");
  }
}

fn main() -> std::io::Result<()> {
  let args: Vec<String> = std::env::args().collect();
  for arg in args.iter() {
    match arg.as_str() {
      "--rco2" => remove_rco2(),
      "--rbx" => symlink_roblox(),
      _ => symlink_roblox(),
    }
  }
  Ok(())
}
