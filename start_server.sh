pulseaudio -D
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
cd /home/joey/classical-997/
rm console.log
sleep 5
while python3 update.py | grep -q 'unable to connect'
do
    echo -e '\a'
    sleep 10
done
node server.js debug autoplay
