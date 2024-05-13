<h1>Installation</h1>

```diff
# install nodejs
sudo apt install nodejs
sudo apt install npm

# install vlc player
sudo apt install vlc

# install iptables
sudo apt install iptables
```

<h1>Instruction</h1>

```diff
cd classical-997

# install npm packages
npm install

# add executable permission
chmod +x start_server.sh
chmod +x map_port.sh

# run script on startup as root
sudo crontab -e
@reboot /home/{user}/classical-997/map_port.sh

# run script on startup as user
crontab -e
@reboot ~/classical-997/start_server.sh
```

<h1>Audio Settings</h1>

```diff
# disable built-in sound card
sudo nano /etc/modprobe.d/alsa-blacklist.conf
blacklist snd_bcm2835

# change bit depth and smaple rate
sudo nano /etc/pulse/daemon.conf
avoid-resampling = yes
default-sample-format = s24le
default-sample-rate = 192000
alternate-sample-rate = 96000
```
