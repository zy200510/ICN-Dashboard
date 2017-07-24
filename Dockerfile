FROM frolvlad/alpine-python3
RUN pip3 install flask
RUN pip3 install pymongo
RUN mkdir /icn
ADD / /icn
EXPOSE 5013
WORKDIR /icn
CMD ["python3", "server.py"]
