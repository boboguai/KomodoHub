use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;
use std::{fs::OpenOptions, io::Write};
use tauri::{Manager, RunEvent};

pub struct ServerChild(pub Mutex<Option<Child>>);

fn wait_for_port(port: u16) -> bool {
  for _ in 0..240 {
    if std::net::TcpStream::connect(("127.0.0.1", port)).is_ok() {
      return true;
    }
    thread::sleep(Duration::from_millis(250));
  }
  false
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let app = tauri::Builder::default()
    .manage(ServerChild(Mutex::new(None)))
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let resource_dir = app
        .path()
        .resource_dir()
        .ok()
        .or_else(|| {
          std::env::current_exe()
            .ok()
            .and_then(|exe| exe.parent().map(|p| p.join("resources")))
        })
        .unwrap_or_else(|| std::path::PathBuf::from("resources"));

      let server_candidates = [
        resource_dir.join("server_bundle"),
        resource_dir.join("resources").join("server_bundle"),
        resource_dir
          .parent()
          .map(|p| p.join("server_bundle"))
          .unwrap_or_else(|| resource_dir.join("server_bundle")),
      ];
      let server_dir = match server_candidates
        .into_iter()
        .find(|candidate| candidate.join("server.js").exists())
      {
        Some(dir) => dir,
        None => return Ok(()),
      };
      let node_candidates = if cfg!(windows) {
        vec![
          resource_dir.join("node").join("node.exe"),
          resource_dir.join("resources").join("node").join("node.exe"),
          resource_dir
            .parent()
            .map(|p| p.join("resources").join("node").join("node.exe"))
            .unwrap_or_else(|| resource_dir.join("node").join("node.exe")),
        ]
      } else {
        vec![
          resource_dir.join("node").join("bin").join("node"),
          resource_dir.join("resources").join("node").join("bin").join("node"),
          resource_dir
            .parent()
            .map(|p| p.join("resources").join("node").join("bin").join("node"))
            .unwrap_or_else(|| resource_dir.join("node").join("bin").join("node")),
        ]
      };

      let node_bin = node_candidates
        .into_iter()
        .find(|candidate| candidate.exists())
        .unwrap_or_else(|| std::path::PathBuf::from("node"));

      let mut cmd = Command::new(&node_bin);
      cmd.current_dir(&server_dir);
      let bundled_db = server_dir.join("prisma").join("dev.db");
      let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_else(|_| ".".to_string());
      let runtime_db_dir = std::path::PathBuf::from(local_app_data).join("KomodoHubData");
      let _ = std::fs::create_dir_all(&runtime_db_dir);
      let runtime_db = runtime_db_dir.join("dev.db");
      if !runtime_db.exists() {
        let _ = std::fs::copy(&bundled_db, &runtime_db);
      }
      let db_url = format!("file:{}", runtime_db.to_string_lossy().replace('\\', "/"));
      let _ = std::fs::write(
        server_dir.join(".env"),
        format!(
          "DATABASE_URL=\"{}\"\nJWT_SECRET=\"komodo-hub-desktop-local-secret-32-chars-minimum\"\n",
          db_url
        ),
      );
      cmd.env("DATABASE_URL", db_url);
      cmd.env("JWT_SECRET", "komodo-hub-desktop-local-secret-32-chars-minimum");
      cmd.env("PORT", "3000");
      cmd.env("HOSTNAME", "127.0.0.1");
      cmd.env("NODE_ENV", "production");
      cmd.arg("server.js");
      if let Ok(mut logf) = OpenOptions::new()
        .create(true)
        .append(true)
        .open(server_dir.join("tauri-server.log"))
      {
        let _ = writeln!(
          logf,
          "[launcher] node={} cwd={} db={}",
          node_bin.display(),
          server_dir.display(),
          runtime_db.display()
        );
      }
      if let Ok(outf) = OpenOptions::new()
        .create(true)
        .append(true)
        .open(server_dir.join("tauri-server.log"))
      {
        cmd.stdout(Stdio::from(outf));
      }
      if let Ok(errf) = OpenOptions::new()
        .create(true)
        .append(true)
        .open(server_dir.join("tauri-server.log"))
      {
        cmd.stderr(Stdio::from(errf));
      }

      let child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) => {
          log::error!("Failed to start Next server: {e}");
          return Ok(());
        }
      };

      {
        let state = app.state::<ServerChild>();
        *state.0.lock().expect("server child mutex") = Some(child);
      }

      if !wait_for_port(3000) {
        log::warn!("Next server did not respond on port 3000 in time");
      }

      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application");

  app.run(|app_handle, event| {
    if let RunEvent::Exit = event {
      if let Some(state) = app_handle.try_state::<ServerChild>() {
        if let Ok(mut guard) = state.0.lock() {
          if let Some(mut child) = guard.take() {
            let _ = child.kill();
          }
        }
      }
    }
  });
}
