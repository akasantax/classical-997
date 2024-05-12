<h1>Installation</h1>

```diff
# install nodejs
sudo apt install nodejs
sudo apt install npm

# install vlc player
sudo apt install vlc
```

<h1>Instruction</h1>

```diff
cd classical-997

# install npm packages
npm install

# add executable permission
chmod +x start_server.sh
chmod +x map_port.sh

# disable built-in sound card
cd /etc/modprobe.d
sudo nano alsa-blacklist.conf
blacklist snd_bcm2835

# run script on startup as root
sudo crontab -e
@reboot /home/{user}/classical-997/map_port.sh

# run script on startup as user
crontab -e
@reboot ~/classical-997/start_server.sh
```
