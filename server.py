# !flask/bin/python
from flask import Flask, jsonify, Response, request, send_from_directory
from controller.app_controller import AppController
# create simple flask server
flaskInstance = Flask(__name__, static_url_path='')

app = None


# default handler
@flaskInstance.errorhandler(404)
def not_found(error):
    response = jsonify({'error': error.description})
    return response


@flaskInstance.route('/', methods=['GET'])
def index():
    print(request.query_string)
    return flaskInstance.send_static_file('index.html')

#
# def send_css(path):
#     return send_from_directory('static/css', path)


@flaskInstance.route('/script/<path:path>', methods=['GET'])
def send_script(path):
    return send_from_directory('static/script', path)


@flaskInstance.route('/data', methods=['POST'])
def receive_data():
    return "OK"


@flaskInstance.route('/topology', methods=['GET'])
def get_topology():
    data = app.get_topology()
    return jsonify(data)


@flaskInstance.route('/group', methods=['GET'])
def get_group_data():
    data = app.get_topology()
    return jsonify(data)


@flaskInstance.route('/selected/<id>', methods=['GET'])
def get_selected_data(id):
    data = app.get_selected_data(id)
    return jsonify(data)


@flaskInstance.route('/id', methods=['GET'])
def get_node_data():
    data = app.get_topology()
    return jsonify(data)


@flaskInstance.route('/summary', methods=['GET'])
def get_comparison_data():
    data = app.get_summary_data()
    return jsonify(data)

if __name__ == "__main__":

    if app is None:
        app = AppController("./settings/topology.settings.json")
        #app.init_mock_data()

    # local_ip = input("--Please input local ip:\n")
    local_ip = "0.0.0.0"
    flaskInstance.run(debug=False, host=local_ip, port=5013)
    print('main thread finished!')
