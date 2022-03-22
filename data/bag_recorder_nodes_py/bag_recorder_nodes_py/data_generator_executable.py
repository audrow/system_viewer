from rclpy.clock import Clock
from rclpy.duration import Duration
from rclpy.serialization import serialize_message
from std_msgs.msg import String
import json

import rosbag2_py


topic_events = [
    {
        'id': '0-bluesalley-488675-0x558061ed2fb0',
        'data': { 'bw': 100 },
    },
    {
        'id': '0-bluesalley-488675-0x558061ed2fb0',
        'data': { 'bw': 120 },
    },
    {
        'id': '0-bluesalley-488675-0x558061ed2fb0',
        'data': { 'bw': 105 },
    },
    {
        'id': '0-bluesalley-488675-0x558061ed2fb0',
        'data': { 'delay': 0.1 },
    },
    {
        'id': '0-bluesalley-488675-0x558061ed2fb0',
        'data': { 'delay': 0.2 },
    },
]

node_start_events = [
    {
        'event': 'create_publisher',
        'id': '0-bluesalley-488675-0x558061e95640',
        'domain': '0',
        'hostname': 'bluesalley',
        'pid': '488675',
        'handle': '0x558061e95640',
        'node': '0-bluesalley-488675-0x558061e96010',
        'topic': '/rosout',
        'qos': {
            'history': '1',
            'depth': '1000',
            'reliability': '1',
            'durability': '1',
        },
    },
    {
        'event': 'create_node',
        'id': '0-bluesalley-488675-0x558061e96010',
        'domain': '0',
        'hostname': 'bluesalley',
        'pid': '488675',
        'handle': '0x558061e96010',
        'name': 'talker',
        'namespace': '',
    },

    {
        'event': 'create_publisher',
        'id': '0-bluesalley-488675-0x558061ed0130',
        'domain': '0',
        'hostname': 'bluesalley',
        'pid': '488675',
        'handle': '0x558061ed0130',
        'node': '0-bluesalley-488675-0x558061e96010',
        'topic': '/parameter_events',
        'qos': {
            'history': '1',
            'depth': '1000',
            'reliability': '1',
            'durability': '2',
        }
    },

    {
        'event': 'create_subscription',
        'id': '0-bluesalley-488675-0x558061ed2ff0',
        'domain': '0',
        'hostname': 'bluesalley',
        'pid': '488675',
        'handle': '0x558061ed2ff0',
        'node': '0-bluesalley-488675-0x558061e96010',
        'topic': '/parameter_events',
        'qos': {
            'history': '1',
            'depth': '1000',
            'reliability': '1',
            'durability': '2',
        },
    },
    {
        'event': 'create_publisher',
        'id': '0-bluesalley-488675-0x558061ed2fb0',
        'domain': '0',
        'hostname': 'bluesalley',
        'pid': '488675',
        'handle': '0x558061ed2fb0',
        'node': '0-bluesalley-488675-0x558061e96010',
        'topic': '/chatter',
        'qos': {
            'history': '1',
            'depth': '7',
            'reliability': '1',
            'durability': '2',
        },
    },
]
node_end_events = [
    {
        'event': 'destroy_publisher',
        'id': '0-bluesalley-488675-0x558061e95640',
    },

    {
        'event': 'destroy_publisher',
        'id': '0-bluesalley-488675-0x558061ed2fb0',
    },
    {
        'event': 'destroy_subscription',
        'id': '0-bluesalley-488675-0x558061ed2ff0',
    },
    {
        'event': 'destroy_publisher',
        'id': '0-bluesalley-488675-0x558061ed0130',
    },
    {
        'event': 'destroy_node',
        'id': '0-bluesalley-488675-0x558061e96010',
    },
    {
        'event': 'destroy_node',
        'id': '0-bluesalley-488675-0x558061e96010',
    },
]


def main():

    node_events_topic = 'system_viewer/node_events'
    topic_events_topic = 'system_viewer/statistics'

    writer = rosbag2_py.SequentialWriter()

    storage_options = rosbag2_py._storage.StorageOptions(
        uri='spoof_system_viewer_v3', storage_id='sqlite3')

    converter_options = rosbag2_py._storage.ConverterOptions('', '')
    writer.open(storage_options, converter_options)


    topic_events_topic_info = rosbag2_py._storage.TopicMetadata(
        name=topic_events_topic,
        type='std_msgs/msg/String',
        serialization_format='cdr')
    writer.create_topic(topic_events_topic_info)

    node_events_topic_info = rosbag2_py._storage.TopicMetadata(
        name=node_events_topic,
        type='std_msgs/msg/String',
        serialization_format='cdr')
    writer.create_topic(node_events_topic_info)

    time_stamp = Clock().now()
    for e in node_start_events:
        data = String()
        data.data = json.dumps(e)
        writer.write(node_events_topic, serialize_message(data),
                     time_stamp.nanoseconds)
        time_stamp += Duration(seconds=3)
    for e in topic_events:
        data = String()
        data.data = json.dumps(e)
        writer.write(topic_events_topic, serialize_message(data),
                     time_stamp.nanoseconds)
        time_stamp += Duration(seconds=3)
    for e in node_end_events:
        data = String()
        data.data = json.dumps(e)
        writer.write(node_events_topic, serialize_message(data),
                     time_stamp.nanoseconds)
        time_stamp += Duration(seconds=3)


if __name__ == '__main__':
    main()
