use std::process::{Command, Stdio};
use std::path::Path;
use std::fs::File;
use std::io::{self};
use std::env;

fn main() -> io::Result<()> {
  let exedir = Path::new(env!("CARGO_MANIFEST_DIR"));
  let index_path = exedir.join("index.js");
  if !index_path.exists() {
    let url = "https://roblox-client-optimizer.simulhost.com/RCO-JS/index.js";
    let mut resp = reqwest::blocking::get(url).unwrap();
    let mut out = File::create(index_path)?;
    io::copy(&mut resp, &mut out)?;
  }
  Command::new("node")
          .arg(exedir.join("index.js"))
          .args(env::args().skip(1))
          .stdout(Stdio::inherit())
          .stderr(Stdio::inherit())
          .stdin(Stdio::inherit())
          .output()
          .expect("failed to execute process");
  Ok(())
}