from pymongo import MongoClient
from .common import *
import time


class DBManager:

    def __init__(self):
        self.client = MongoClient()
        self.node = self.client.data.node

    def get_node_data(self, nodeId):
        result = []
        for record in self.node.find({"id": nodeId}):
            result.append(record)
        return result

    def get_nodes_data(self, ids):
        result = []
        for record in self.node.find():
            if record[ID] in ids:
                result.append(record)
        return result

    def get_group_data(self, groupId):
        result = []
        for record in self.node.find({GroupId:groupId}):
            result.append(record)
        return result

    def save_nodes_data(self, list_data):
            
        result = self.node.insert_many(list_data)
        return result.inserted_ids


db_manager = DBManager()