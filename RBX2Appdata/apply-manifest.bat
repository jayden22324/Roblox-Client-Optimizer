copy rbx2appdata.exe rbx2appdata2.exe
resedit rbx2appdata2.exe rbx2appdata.exe --raw 24,1,@res/app.manifest --allow-shrink
del rbx2appdata2.exe
