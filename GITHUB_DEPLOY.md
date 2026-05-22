# GitHub Deployment

This repo contains two deploy paths:

1. A working GitHub Pages deploy for the current web demo.
2. A Unity WebGL build workflow template for the future Unity project.

## Current Web Demo

The current React/canvas version can deploy immediately through:

```text
.github/workflows/deploy-web.yml
```

After pushing to GitHub:

1. Open the GitHub repository.
2. Go to **Settings -> Pages**.
3. Set **Build and deployment** to **GitHub Actions**.
4. Push to `main` or run **Deploy Web Demo** manually from the Actions tab.
5. GitHub will show the published Pages URL.

The URL will usually look like:

```text
https://<username>.github.io/<repo-name>/
```

## Unity WebGL

The Unity workflow is:

```text
.github/workflows/unity-webgl.yml
```

It is currently a build artifact workflow, not an automatic public deploy.

Before it can run successfully, `unity-webgl/` must be a complete Unity project with:

```text
unity-webgl/Assets/
unity-webgl/Packages/
unity-webgl/ProjectSettings/
```

You also need GitHub secrets for GameCI:

```text
UNITY_LICENSE
UNITY_EMAIL
UNITY_PASSWORD
```

See:

```text
unity-webgl/README.md
```

## Commands To Create The GitHub Repo

The GitHub CLI is not installed in this environment, so create the repo manually on GitHub, then run:

```bash
cd ~/Projects/market-swarm
git add .
git commit -m "Initial Market Swarm web and Unity WebGL source"
git branch -M main
git remote add origin git@github.com:<username>/<repo-name>.git
git push -u origin main
```

If you use HTTPS instead of SSH:

```bash
git remote add origin https://github.com/<username>/<repo-name>.git
```

