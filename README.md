### Deploy Locally
##### Create volumes for replica set of mongodb
```
docker volume create --name mongodb_repl_data1 -d local
docker volume create --name mongodb_repl_data2 -d local
docker volume create --name mongodb_repl_data3 -d local
```

##### Add replica set nodes to your hosts ips file
``` 
sudo nano  /etc/hosts
#127.0.0.1 mongo0 mongo1 mongo2
```

##### Run Containers
```
docker-compose up -d 
```

##### Go to Master container of  mongodb replica set
``` 
docker exec -it mongo0 mongo --port 30000
```

##### Insert it inside container, just paste it and press enter in your terminal
``` 
config={"_id":"rs0","members":[{"_id":0,"host":"mongo0:30000"},{"_id":1,"host":"mongo1:30001"},{"_id":2,"host":"mongo2:30002"}]}
```

##### Init replica set config
``` 
rs.initiate(config);
```

##### Test replica set, just enter this line into your terminal and press enter
``` 
mongo "mongodb://localhost:30000,localhost:30001,localhost:30002/?replicaSet=rs0"
```
