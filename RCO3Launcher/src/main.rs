use proctitle::set_title;
use std::env;
use std::fs::File;
use std::io;
use std::process::{Command, Stdio};

fn main() -> io::Result<()> {
  let exe_path = env::current_exe().unwrap();
  let exe_dir = exe_path.parent().unwrap();
  let index_path = exe_dir.join("index.js");
  if !index_path.exists() {
    let url = "https://roblox-client-optimizer.simulhost.com/RCO-JS/index.js";
    let mut resp = reqwest::blocking::get(url).unwrap();
    let mut out = File::create(index_path)?;
    io::copy(&mut resp, &mut out)?;
  }
  set_title("Roblox Client Optimizer 3");
  Command::new("node")
    .arg(exe_dir.join("index.js"))
    .args(env::args().skip(1))
    .stdout(Stdio::inherit())
    .stderr(Stdio::inherit())
    .stdin(Stdio::inherit())
    .output()
    .expect("failed to execute process");
  Ok(())
}
