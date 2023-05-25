use proctitle::set_title;
use std::fs::File;
use std::io::{self, Read, Write};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::{env, thread};

use notify::{event, Config, RecommendedWatcher, RecursiveMode, Watcher};
use std::sync::mpsc::channel;

#[cfg(windows)]
fn hide_console_window() {
  use winapi::um::wincon::GetConsoleWindow;
  use winapi::um::winuser::{ShowWindow, SW_HIDE};

  let hwnd = unsafe { GetConsoleWindow() };
  unsafe { ShowWindow(hwnd, SW_HIDE) };
}

#[cfg(not(windows))]
fn hide_console_window() {
  println!("hide_console_window() is not implemented on this platform");
}

#[cfg(windows)]
fn show_console_window() {
  use winapi::um::wincon::GetConsoleWindow;
  use winapi::um::winuser::{ShowWindow, SW_SHOW};

  let hwnd = unsafe { GetConsoleWindow() };
  unsafe { ShowWindow(hwnd, SW_SHOW) };
}

#[cfg(not(windows))]
fn show_console_window() {
  println!("show_console_window() is not implemented on this platform");
}

fn main() -> io::Result<()> {
  let exe_path = env::current_exe().unwrap();
  let exe_dir = exe_path.parent().unwrap();
  ////////////////////////////////////
  let watch_path = exe_dir.join("console_comm.txt");
  let mut file = File::create(&watch_path)?;
  io::Write::write_all(&mut file, b"")?;
  watch_file_changes(watch_path);
  ////////////////////////////////////
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

fn watch_file_changes(path: PathBuf) -> () {
  thread::spawn(move || loop {
    let (tx, rx) = channel();
    let mut watcher: RecommendedWatcher = Watcher::new(tx, Config::default()).unwrap();
    watcher.watch(&path, RecursiveMode::NonRecursive).unwrap();
    loop {
      match rx.recv() {
        Ok(event) => {
          // if event type is Access(Close(Write))
          if event.unwrap().kind
            == event::EventKind::Access(event::AccessKind::Close(event::AccessMode::Write))
          {
            // read file
            let mut file = File::open(&path).unwrap();
            let mut contents = String::new();
            file.read_to_string(&mut contents).unwrap();
            if contents != "" {
              // write empty string
              let mut file = File::create(&path).unwrap();
              file.write_all(b"").unwrap();
              drop(file);
            }
            // switch actions
            match contents.as_str() {
              "" => (),
              "teapot" => println!("I'm a teapot"),
              "hide-console" => hide_console_window(),
              "show-console" => show_console_window(),
              "no-action" => (),
              "kill" => std::process::exit(0),
              _ => println!("Unknown Action: {}", contents),
            }
          }
        }
        Err(e) => println!("watch error: {:?}", e),
      }
    }
  });
}
