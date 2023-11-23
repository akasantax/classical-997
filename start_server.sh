pulseaudio -D
cd /home/joey/classical-997/
rm console.log
sleep 5
while python3 update.py | grep -q 'unable to connect'
do
    echo -e '\a'
    sleep 10
done
node server.js debug autoplay
