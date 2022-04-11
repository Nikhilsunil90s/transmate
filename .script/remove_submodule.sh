export submodule="folder/submodule"
#example:
#export submodule="imports/bigquery"
#export submodule=".deploy"
git rm "$submodule"
rm -rf ".git/modules/$submodule"
git config -f ".git/config" --remove-section "submodule.$submodule" 2> /dev/null
git commit -m "Remove submodule $submodule"