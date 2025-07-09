import os
import urllib.request
import tarfile
import tempfile
import sys
from pathlib import Path


class Progress:
    def __init__(self, label: str):
        self.tot_size = 0
        self.cur_size = 0
        self.old_perc = 0
        self.new_perc = 0
        self.label = label

    def reporthook(self, _: int, inc_size: int, tot_size: int):
        self.tot_size = tot_size
        self.cur_size += inc_size
        self._print_progress_bar()

    def _format_size(self, size_bytes: int) -> str:
        if size_bytes == 0:
            return "0B"

        size_float = float(size_bytes)
        for unit in ["B", "KB", "MB", "GB"]:
            if size_float < 1024.0:
                return f"{size_float:.1f}{unit}"
            size_float /= 1024.0
        return f"{size_float:.1f}TB"

    def _print_progress_bar(self):
        if self.tot_size == 0:
            return

        self.old_perc, self.new_perc = self.new_perc, int(
            (self.cur_size / self.tot_size) * 100
        )

        if self.new_perc > self.old_perc:
            tot_bar = 30
            cur_bar = int(tot_bar * self.new_perc // 100)
            bar = "█" * cur_bar + "░" * (tot_bar - cur_bar)
            cur_size_formatted = self._format_size(self.cur_size)
            tot_size_formatted = self._format_size(self.tot_size)
            size_info = f" ({cur_size_formatted}/{tot_size_formatted})"
            sys.stdout.write(f"\r{self.label}: [{bar}] {self.new_perc}%{size_info}")
            sys.stdout.flush()
            if self.new_perc == 100:
                print()


class Resourcer:
    def __init__(self, source_url: str | None = None, target_dir: str | None = None):
        self.source_url = self._get_val("STANZA_RESOURCES_URL", source_url)
        self.target_dir = self._get_val("STANZA_RESOURCES_DIR", target_dir)

    def _get_val(self, env_var: str, override: str | None = None) -> str:
        if override is not None:
            return override
        elif (url := os.getenv(env_var)) is not None:
            return url
        else:
            raise ValueError(f"{env_var} environment variable is required")

    def ensure_available(self) -> None:
        resources_dir = Path(self.target_dir)
        if resources_dir.exists() and (resources_dir / "resources.json").exists():
            return
        self.download_and_extract_model()

    def download_and_extract_model(self) -> None:
        resources_dir = Path(self.target_dir)
        resources_dir.mkdir(parents=True, exist_ok=True)

        print("Fetching Stanza resources...")
        print(f"Source URL: {self.source_url}")
        print(f"Target dir: {resources_dir.absolute()}")

        with tempfile.NamedTemporaryFile(suffix=".tgz", delete=False) as tmp_file:
            try:
                self._download_resources(tmp_file)
                self._extract_resources(tmp_file, resources_dir)
            finally:
                os.unlink(tmp_file.name)

    def _download_resources(self, tmp_file) -> None:
        progress = Progress("Downloading")
        urllib.request.urlretrieve(self.source_url, tmp_file.name, progress.reporthook)

    def _extract_resources(self, tmp_file, resources_dir) -> None:
        with tarfile.open(tmp_file.name, "r:gz") as tar:
            members = tar.getmembers()
            resources_json = next(
                (m for m in members if m.name.endswith("/resources.json")), None
            )
            if not resources_json:
                raise ValueError("resources.json not found in archive")
            path_prefix = resources_json.name[: -len("resources.json")]
            resources_list = [m for m in members if m.name.startswith(path_prefix)]
            total_size = sum(member.size for member in resources_list)
            progress = Progress("Extracting")
            for i, member in enumerate(resources_list, 1):
                member.name = member.name[len(path_prefix) :]
                tar.extract(member, path=resources_dir, filter="data")
                progress.reporthook(i, member.size, total_size)
