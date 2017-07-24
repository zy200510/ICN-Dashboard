import json
import random
import time
import threading
import datetime
from .db_controller import db_manager
from .common import *



class AppController:
    
    def __init__(self, topology_file_path):
        try:
            with open(topology_file_path) as data_file:    
                self.data = json.load(data_file)
        except ValueError:
            print("Failed to decode the topology setting from {0}".format(topology_file_path))
        except:
            print("Failed to find the topology setting at {0}".format(topology_file_path))

        nodes = self.data[Nodes]
        for node in nodes:
            capacity = random.randint(50, 100)
            cache = random.randint(0, capacity)
            node[Capacity] = capacity
            node[Cache] = cache

        t = threading.Thread(target=self.updateData)
        t.daemon = True
        t.start()

    def get_topology(self):
        return self.data

    def get_selected_data(self, id):
         nodes = self.data[Nodes]
         for node in nodes:
            if node[ID] == id:
                return node[Cache]

    def get_summary_data(self):

        sum_data = 0
        nodes = self.data[Nodes]
        data_result = {}
        data_cache = {}

        data_result["cache"] = data_cache

        for i in range(10):
              data_cache[i] = 0

        for node in nodes:
            sum_data = sum_data + node[Cache]
            ratio = node[Cache] / node[Capacity]
            for key in data_cache:
                if ratio*10 > key and ratio*10 < key +1:
                    data_cache[key] = data_cache[key] + 1
                    break
        data_result["sum"] = sum_data
        return  data_result   

    def init_mock_data(self):
        nodes = self.data[Nodes]
        for node in nodes:
            data_connection = []
            now = datetime.datetime.now()
            for i in range(10):
                capacity = random.randint(0, 1000)
                cache = random.randint(0, capacity)
                current = now - i * datetime.timedelta(minutes=1)
                item = {ID:node[ID], GroupId:node[GroupId], Cache:cache, Capacity:capacity, Time:current}
                data_connection.append(item)
            db_manager.save_nodes_data(data_connection)

    def updateData(self):
        nodes = self.data[Nodes]
        while True:
            time.sleep(5)
            for node in nodes:
                data_connection = []
                now = datetime.datetime.now()
                newValue = random.randint(-3,3)
                if node[Cache] + newValue > node[Capacity]:
                    node[Cache] = node[Capacity]
                elif node[Cache] + newValue < 0:
                    node[Cache] = 0;
                else:
                    node[Cache] = node[Cache] + newValue
            
