import os
import sys
import json
import time
import urllib.request
import urllib.parse
import shutil

QBIT_URL = 'http://localhost:8082'
MAX_SEED_SECONDS = 12 * 3600  # 12 horas
DOWNLOADS_DIR = '/home/paim/Downloads'

def get_torrents():
    try:
        req = urllib.request.Request(f"{QBIT_URL}/api/v2/torrents/info")
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        print(f"Erro ao conectar na API do qBittorrent: {e}")
        return []

def delete_torrent(torrent_hash, delete_files=True):
    try:
        data = urllib.parse.urlencode({
            'hashes': torrent_hash,
            'deleteFiles': 'true' if delete_files else 'false'
        }).encode('utf-8')
        req = urllib.request.Request(f"{QBIT_URL}/api/v2/torrents/delete", data=data)
        with urllib.request.urlopen(req) as r:
            return r.status == 200
    except Exception as e:
        print(f"Erro ao deletar torrent {torrent_hash}: {e}")
        return False

def clean_orphaned_downloads(downloads_dir, active_names, dry_run=True):
    print("\n=== LIMPEZA DE PASTAS ÓRFÃS EM DOWNLOADS ===")
    if not os.path.exists(downloads_dir):
        print(f"Diretório de downloads não existe: {downloads_dir}")
        return 0

    try:
        entries = os.listdir(downloads_dir)
    except OSError as e:
        print(f"Erro ao listar {downloads_dir}: {e}")
        return 0

    removed_count = 0
    for entry in entries:
        if entry in ('incomplete', '.') or entry.startswith('.'):
            continue
        
        entry_path = os.path.join(downloads_dir, entry)
        if os.path.isdir(entry_path):
            if entry not in active_names:
                if dry_run:
                    print(f"[Simulação] Pasta órfã seria removida: {entry}")
                    removed_count += 1
                else:
                    print(f"Removendo pasta órfã: {entry}")
                    try:
                        shutil.rmtree(entry_path)
                        print("  -> Removida com sucesso.")
                        removed_count += 1
                    except Exception as e:
                        print(f"  -> Erro ao remover: {e}")
    return removed_count

def main():
    dry_run = True
    if len(sys.argv) > 1 and sys.argv[1] == '--delete':
        dry_run = False

    print("================================================================")
    print("=== AUTOMATIZAÇÃO DE LIMPEZA DE DOWNLOADS DO QBITTORRENT ===")
    print(f"Modo: {'SIMULAÇÃO (DRY RUN)' if dry_run else 'DELETAR REAL'}")
    print("================================================================\n")

    torrents = get_torrents()
    active_names = set()
    
    if torrents:
        for t in torrents:
            active_names.add(t['name'])

    removed_torrents = 0
    kept_count = 0
    current_time = time.time()

    if torrents:
        for t in torrents:
            if t['progress'] < 1.0 or t['state'] in ('missingFiles', 'error'):
                continue

            completion_time = t.get('completion_on', -1)
            if completion_time <= 0:
                continue

            elapsed_seconds = current_time - completion_time
            elapsed_hours = elapsed_seconds / 3600

            if elapsed_seconds >= MAX_SEED_SECONDS:
                if not dry_run:
                    print(f"Removendo torrent concluído há {elapsed_hours:.1f} horas: {t['name']}")
                    if delete_torrent(t['hash'], delete_files=True):
                        print("  -> Torrent e arquivos removidos com sucesso.")
                        removed_torrents += 1
                    else:
                        print("  -> Falha ao remover.")
                else:
                    print(f"[Simulação] Seria removido (concluído há {elapsed_hours:.1f} horas): {t['name']}")
                    removed_torrents += 1
            else:
                hours_left = (MAX_SEED_SECONDS - elapsed_seconds) / 3600
                print(f"Mantendo: '{t['name']}' | Concluído há {elapsed_hours:.1f}h (Resta {hours_left:.1f}h de seeding)")
                kept_count += 1
    else:
        print("Nenhum torrent ativo ou concluído no qBittorrent.")

    removed_orphans = clean_orphaned_downloads(DOWNLOADS_DIR, active_names, dry_run)

    print("\n=== RESUMO ===")
    if dry_run:
        print(f"Simulação concluída. {removed_torrents} torrents e {removed_orphans} pastas órfãs seriam removidos. {kept_count} torrents mantidos.")
        print("Para executar a remoção real, rode com '--delete'.")
    else:
        print(f"Limpeza concluída! {removed_torrents} torrents e {removed_orphans} pastas órfãs removidos de verdade. {kept_count} torrents mantidos.")

if __name__ == '__main__':
    main()
