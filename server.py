# !flask/bin/python
from flask import Flask, jsonify, Response, request, send_from_directory

# create simple flask server
flaskInstance = Flask(__name__, static_url_path='')

# default handler
@flaskInstance.errorhandler(404)
def not_found(error):
    response = jsonify({'error': error.description})
    return response


@flaskInstance.route('/', methods=['GET'])
def index():
    print(request.query_string)
    return flaskInstance.send_static_file('index.html')


def send_css(path):
    return send_from_directory('static/css', path)

@flaskInstance.route('/script/<path:path>', methods=['GET'])
def send_script(path):
    return send_from_directory('static/script', path)

if __name__ == "__main__":
    local_ip = raw_input("--Please input local ip:\n")
    flaskInstance.run(debug=False, host=local_ip, port=5013)
    print('main thread finished!')
