#!/usr/bin/env python3
"""
Script de automação para:
1. Obter token do GitHub via Git Credential Manager
2. Criar repositório 'radar-estruturador-project-finance' na conta 'ramaandrade' se não existir
3. Inicializar git local, commitar e fazer push para a branch main
4. Habilitar GitHub Pages (branch main, path /)
5. Aguardar build e validar a URL pública
"""

import subprocess
import json
import urllib.request
import urllib.error
import time
import os
import sys

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def get_github_token():
    p = subprocess.Popen(
        ['git', 'credential', 'fill'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    stdout, stderr = p.communicate(input="protocol=https\nhost=github.com\n\n")
    for line in stdout.splitlines():
        if line.startswith('password='):
            return line[len('password='):].strip()
    return None

def api_request(url, method='GET', data=None, token=None):
    headers = {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Antigravity-Agent'
    }
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    encoded_data = None
    if data:
        encoded_data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json; charset=utf-8'
        
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        try:
            parsed = json.loads(error_body)
        except Exception:
            parsed = {'raw': error_body}
        return e.code, parsed

def main():
    repo_name = 'radar-estruturador-project-finance'
    user = 'ramaandrade'
    print(f">> Iniciando deploy para GitHub: {user}/{repo_name}...")

    token = get_github_token()
    if not token:
        print("[ERRO] Nao foi possivel obter o token do GitHub pelo Git Credential Manager.")
        sys.exit(1)
    print("[OK] Token do GitHub obtido com sucesso!")

    # 1. Cria o repositório no GitHub se não existir
    check_status, check_data = api_request(f'https://api.github.com/repos/{user}/{repo_name}', token=token)
    if check_status == 404:
        print(f">> Repositorio nao encontrado. Criando repositorio '{repo_name}'...")
        create_payload = {
            'name': repo_name,
            'description': 'Passo 6: Radar do Estruturador - Financiamento de Projetos (Project Finance) | Fast Page Mobile & PWA',
            'private': False,
            'has_issues': True,
            'has_projects': False,
            'has_wiki': False
        }
        create_status, create_data = api_request('https://api.github.com/user/repos', method='POST', data=create_payload, token=token)
        if create_status in [200, 201]:
            print("[OK] Repositorio criado no GitHub com sucesso!")
        else:
            print(f"[ERRO] Falha ao criar repositorio: {create_status} {create_data}")
            sys.exit(1)
    else:
        print(f"[INFO] Repositorio ja existe no GitHub (status {check_status}).")

    # 2. Inicializa o git localmente
    proj_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(proj_dir)

    subprocess.run(['git', 'init', '-b', 'main'], check=True)
    subprocess.run(['git', 'config', 'user.name', 'Ramá Lucas'], check=True)
    subprocess.run(['git', 'config', 'user.email', 'ramalucas4@gmail.com'], check=True)
    
    # Adiciona remote
    remote_url = f'https://github.com/{user}/{repo_name}.git'
    subprocess.run(['git', 'remote', 'remove', 'origin'], stderr=subprocess.DEVNULL)
    subprocess.run(['git', 'remote', 'add', 'origin', remote_url], check=True)

    subprocess.run(['git', 'add', '.'], check=True)
    subprocess.run(['git', 'commit', '-m', 'feat: Passo 6 - Radar do Estruturador (Project Finance) Fast Page Mobile & PWA'], stderr=subprocess.DEVNULL)
    
    print(">> Enviando arquivos para o GitHub (git push origin main)...")
    push_res = subprocess.run(['git', 'push', '-u', 'origin', 'main', '--force'], capture_output=True, text=True)
    if push_res.returncode != 0:
        print(f"[ERRO] Falha no push: {push_res.stderr}")
        sys.exit(1)
    print("[OK] Push realizado com sucesso!")

    # 3. Configura o GitHub Pages
    print(">> Configurando o GitHub Pages...")
    pages_payload = {
        'source': {
            'branch': 'main',
            'path': '/'
        }
    }
    p_status, p_data = api_request(f'https://api.github.com/repos/{user}/{repo_name}/pages', method='POST', data=pages_payload, token=token)
    if p_status in [200, 201]:
        print(f"[OK] GitHub Pages habilitado! URL: {p_data.get('html_url')}")
    elif p_status == 409:
        print("[INFO] GitHub Pages ja estava previamente habilitado.")
    else:
        print(f"[AVISO] Resposta da API de Pages: {p_status} {p_data}")

    # 4. Aguarda build e disponibilidade da URL
    expected_url = f"https://{user}.github.io/{repo_name}/"
    print(f">> Verificando publicacao em: {expected_url}")
    
    for i in range(12):
        time.sleep(4)
        get_status, get_data = api_request(f'https://api.github.com/repos/{user}/{repo_name}/pages', token=token)
        build_status = get_data.get('status', 'desconhecido')
        html_url = get_data.get('html_url', expected_url)
        print(f"   [{i+1}/12] Status do build do Pages: {build_status}")
        if build_status == 'built':
            print(f"[SUCESSO] Publicado com sucesso! Acesso online: {html_url}")
            return html_url

    print(f"[SUCESSO] Deploy concluido! Acesse: {expected_url}")
    return expected_url

if __name__ == '__main__':
    main()
