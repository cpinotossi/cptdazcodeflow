# Microsoft authentication, Express.js and oauth code flow

~~~pwsh
npm i
node -r dotenv/config .\src\app.js dotenv_config_path=.env
node -r dotenv/config .\src\app.js dotenv_config_path=.env.dev
Start-Process "msedge.exe" -ArgumentList "--inprivate"
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
