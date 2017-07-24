class Node:
    idGen = 0
    def __init__(self,name, cache, capacity):
        self.cache = cache
        self.capacity = capacity
        self.name = name
        self.id = Node.idGen +1

    
