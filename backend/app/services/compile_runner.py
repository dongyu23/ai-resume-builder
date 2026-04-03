import os
import shutil
import asyncio
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

async def run_command_with_logs(command: list, cwd: str, log_file: str, log_prefix: str = "") -> int:
    """Run a subprocess and stream its output to a log file."""
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(f"\n{log_prefix} Executing: {' '.join(command)}\n")

    try:
        process = await asyncio.create_subprocess_exec(
            *command,
            cwd=cwd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT
        )

        while True:
            line = await process.stdout.readline()
            if not line:
                break
            line_str = line.decode('utf-8', errors='replace')
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(line_str)

        await process.wait()
        return process.returncode
    except Exception as e:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"\nException running command: {e}\n")
        return -1

async def compile_latex(sandbox_dir: str, main_tex: str, compiler: str, compile_id: str):
    status_file = os.path.join(sandbox_dir, "status.json")
    log_file = os.path.join(sandbox_dir, "compile.log")

    # Initialize status
    with open(status_file, "w") as f:
        json.dump({"status": "running", "start_time": datetime.now().isoformat()}, f)
    
    # Clear log file
    with open(log_file, "w", encoding="utf-8") as f:
        f.write(f"> [SYSTEM] Initializing multi-strategy compilation for {main_tex}\n")

    success = False

    # --- Strategy A: System TeXLive (latexmk) ---
    if shutil.which("latexmk"):
        with open(log_file, "a", encoding="utf-8") as f:
            f.write("> [SYSTEM] Strategy A: System TeXLive (latexmk) found. Attempting compilation...\n")
        
        command = [
            "latexmk",
            f"-{compiler}",
            "-shell-escape",
            "-interaction=nonstopmode",
            "-file-line-error",
            "-halt-on-error",
            main_tex
        ]
        
        return_code = await run_command_with_logs(command, sandbox_dir, log_file, "> [Strategy A]")
        if return_code == 0:
            success = True
        else:
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"\n> [SYSTEM] Strategy A failed with code {return_code}. Falling back to Strategy B...\n")
    else:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write("> [SYSTEM] Strategy A: System TeXLive (latexmk) not found in PATH. Skipping...\n")

    # --- Strategy B: Tectonic Engine ---
    if not success:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write("\n> [SYSTEM] Strategy B: Tectonic Engine (Self-contained, auto-downloading packages).\n")
        
        bin_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../bin"))
        tectonic_path = os.path.join(bin_dir, "tectonic")
        
        # Download tectonic if it doesn't exist
        if not os.path.exists(tectonic_path):
            os.makedirs(bin_dir, exist_ok=True)
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"> [SYSTEM] Downloading Tectonic to {tectonic_path} (This only happens once)...\n")
            
            download_cmd = f"curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh"
            try:
                # We use bash to pipe curl to sh
                process = await asyncio.create_subprocess_shell(
                    download_cmd,
                    cwd=bin_dir,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.STDOUT
                )
                
                while True:
                    line = await process.stdout.readline()
                    if not line:
                        break
                    with open(log_file, "a", encoding="utf-8") as f:
                        f.write(line.decode('utf-8', errors='replace'))
                
                await process.wait()
                if process.returncode != 0:
                    with open(log_file, "a", encoding="utf-8") as f:
                        f.write(f"\n> [SYSTEM] Failed to download Tectonic (code {process.returncode}).\n")
            except Exception as e:
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write(f"\n> [SYSTEM] Exception downloading Tectonic: {e}\n")

        if os.path.exists(tectonic_path):
            with open(log_file, "a", encoding="utf-8") as f:
                f.write("> [SYSTEM] Tectonic engine is ready. Starting compilation...\n")
            
            # Run tectonic
            tectonic_cmd = [
                tectonic_path,
                "-Z", "shell-escape",
                "-Z", "continue-on-errors",
                main_tex
            ]
            
            return_code = await run_command_with_logs(tectonic_cmd, sandbox_dir, log_file, "> [Strategy B]")
            if return_code == 0:
                success = True
            else:
                with open(log_file, "a", encoding="utf-8") as f:
                    f.write(f"\n> [SYSTEM] Strategy B failed with code {return_code}.\n")
        else:
            with open(log_file, "a", encoding="utf-8") as f:
                f.write("> [SYSTEM] Strategy B failed because tectonic executable could not be found/downloaded.\n")

    # --- Final Result ---
    if success:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write("\n> [SYSTEM] Compilation finished successfully.\n")
        with open(status_file, "w") as f:
            json.dump({"status": "success", "end_time": datetime.now().isoformat()}, f)
    else:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write("\n> [SYSTEM] All compilation strategies failed.\n")
        with open(status_file, "w") as f:
            json.dump({"status": "failed", "end_time": datetime.now().isoformat(), "error_code": -1}, f)

def get_compile_status(sandbox_dir: str, compile_id: str):
    status_file = os.path.join(sandbox_dir, "status.json")
    if os.path.exists(status_file):
        with open(status_file, "r") as f:
            return json.load(f)
    return None

def get_pdf_path(sandbox_dir: str, compile_id: str):
    for f in os.listdir(sandbox_dir):
        if f.endswith(".pdf"):
            return os.path.join(sandbox_dir, f)
    return None
