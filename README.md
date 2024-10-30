# Microsoft authentication, Express.js and oauth code flow

Install latest Node.js based on https://nodejs.org/en/download/package-manager

~~~pwsh
# installs fnm (Fast Node Manager)
winget install Schniz.fnm

# configure fnm environment
fnm env --use-on-cd | Out-String | Invoke-Expression

# download and install Node.js
fnm use --install-if-missing 22

# verifies the right Node.js version is in the environment
node -v # should print `v22.11.0`

# verifies the right npm version is in the environment
npm -v # should print `10.9.0`
~~~

~~~pwsh

npm outdated @azure/msal-node
npm install @azure/msal-node@latest

npm i
node -r dotenv/config .\src\app.js dotenv_config_path=.env
node -r dotenv/config .\src\app.js dotenv_config_path=.env.dev
Start-Process "msedge.exe" -ArgumentList "--inprivate"
Start-Process "msedge.exe" -ArgumentList "--inprivate", "http://localhost:8000"
npm install -g pm2
pm2 start .\src\app.js
pm2 delete app  
~~~

## Misc

### Git commands

~~~pwsh
$prefix="cptdazcodeflow"
gh repo create $prefix --public
git init
git remote add origin https://github.com/cpinotossi/$prefix.git
git remote -v
git status
git add .gitignore
git add *
git commit -m"init"
git push origin main
git push --recurse-submodules=on-demand
git rm README.md # unstage
git --help
git config advice.addIgnoredFile false
~~~
