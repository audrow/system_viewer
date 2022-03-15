# DIRECTION

## 2022-03-15: Data formats

So let me figure out what I am making now:

The data that this app receives looks like this:

```
{
  event: create_publisher
  id: 0-bluesalley-488675-0x558061e95640
  domain: 0
  hostname: bluesalley
  pid: 488675
  handle: 0x558061e95640
  node: 0-bluesalley-488675-0x558061e96010
  topic: '/rosout'
  qos:
    history: 1
    depth: 1000
    reliability: 1
    durability: 1
}

{
  event: create_node
  id: 0-bluesalley-488675-0x558061e96010
  domain: 0
  hostname: bluesalley
  pid: 488675
  handle: 0x558061e96010
  name: 'talker'
  namespace:
}

{
  event: create_publisher
  id: 0-bluesalley-488675-0x558061ed0130
  domain: 0
  hostname: bluesalley
  pid: 488675
  handle: 0x558061ed0130
  node: 0-bluesalley-488675-0x558061e96010
  topic: '/parameter_events'
  qos:
    history: 1
    depth: 1000
    reliability: 1
    durability: 2
}

{
  event: create_subscription
  id: 0-bluesalley-488675-0x558061ed2ff0
  domain: 0
  hostname: bluesalley
  pid: 488675
  handle: 0x558061ed2ff0
  node: 0-bluesalley-488675-0x558061e96010
  topic: '/parameter_events'
  qos:
    history: 1
    depth: 1000
    reliability: 1
    durability: 2
}

{
  event: create_publisher
  id: 0-bluesalley-488675-0x558061ed2fb0
  domain: 0
  hostname: bluesalley
  pid: 488675
  handle: 0x558061ed2fb0
  node: 0-bluesalley-488675-0x558061e96010
  topic: '/chatter'
  qos:
    history: 1
    depth: 7
    reliability: 1
    durability: 2
}

{
  event: destroy_publisher:
  id: 0-bluesalley-488675-0x558061e95640
}

{
  event: destroy_publisher:
  id: 0-bluesalley-488675-0x558061ed2fb0
}

{
  event: destroy_subscription:
  id: 0-bluesalley-488675-0x558061ed2ff0
}

{
  event: destroy_publisher:
  id: 0-bluesalley-488675-0x558061ed0130
}

{
  event: destroy_node:
  id: 0-bluesalley-488675-0x558061e96010
}
```

and it should result in something that looks like this:

```js
export const initialElements: Elements = [
  // ROS Nodes
  {
    id: '1',
    type: 'rosNode',
    isHidden: false,
    data: {
      namespace: '/viper/NavCamStereo',
      label: 'stereo_camera_controller_really_long_name_to_truncate',
    },
    position,
    style: {width: 275, height: 79},
  },
  {
    id: '2',
    type: 'rosNode',
    isHidden: false,
    data: {
      namespace: '/viper/NavCamStereo',
      label: 'image_adjuster_left_stereo',
    },
    position,
    style: {width: 275, height: 79},
  },
  {
    id: '3',
    type: 'rosNode',
    isHidden: false,
    data: {
      namespace: '/viper/NavCamStereo',
      label: 'image_adjuster_right_stereo',
    },
    position,
    style: {width: 275, height: 79},
  },
  {
    id: '4',
    type: 'rosNode',
    isHidden: false,
    data: {
      namespace: '/viper/NavCamStereo',
      label: 'disparity_node',
    },
    position,
    style: {width: 275, height: 79},
  },
  {
    id: '5',
    type: 'rosNode',
    isHidden: false,
    data: {
      namespace: '/viper/NavCamStereo',
      label: 'point_cloud_node',
    },
    position,
    style: {width: 275, height: 79},
  },
  {
    id: '6',
    type: 'rosNode',
    isHidden: true,
    data: {
      namespace: '/viper/NavCamStereo',
      label: '_a_hidden_node',
    },
    position,
    style: {width: 275, height: 79},
  },

  // ROS Topics
  {
    id: '101',
    type: 'rosTopic',
    isHidden: false,
    data: {
      namespace: '/viper/NavCamStereo',
      label: '/left/image_raw',
    },
    position,
    style: {width: 125, height: 40},
  },
  {
    id: '102',
    type: 'rosTopic',
    isHidden: false,
    data: {
      namespace: '/viper/NavCamStereo',
      label: '/right/image_raw',
    },
    position,
    style: {width: 125, height: 40},
  },
  {
    id: '103',
    type: 'rosTopic',
    isHidden: false,
    data: {
      namespace: '/viper/NavCamStereo',
      label: '/image_raw/adjusted_stereo',
    },
    position,
    style: {width: 125, height: 40},
  },
  {
    id: '104',
    type: 'rosTopic',
    isHidden: false,
    data: {
      namespace: '/viper/NavCamStereo',
      label: '/right/image_raw/adjusted_stereo',
    },
    position,
    style: {width: 125, height: 40},
  },

  {
    id: '105',
    type: 'rosTopic',
    isHidden: false,
    data: {
      namespace: '/viper/NavCamStereo',
      label: '/disparity',
    },
    position,
    style: {width: 125, height: 40},
  },
  {
    id: '106',
    type: 'rosTopic',
    isHidden: false,
    data: {
      namespace: '/viper/NavCamStereo',
      label: '/points2',
    },
    position,
    style: {width: 125, height: 40},
  },

  // Publishers/Subscribers (Edges)
  {
    id: 'edge-1-101',
    type: 'default',
    isHidden: false,
    label: '10Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '1',
    target: '101',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },
  {
    id: 'edge-1-102',
    type: 'default',
    isHidden: false,
    label: '10Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '1',
    target: '102',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },

  {
    id: 'edge-101-2',
    type: 'default',
    isHidden: false,
    label: '11Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '101',
    target: '2',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },
  {
    id: 'edge-102-3',
    type: 'default',
    isHidden: false,
    label: '12Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '102',
    target: '3',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },
  {
    id: 'edge-2-103',
    type: 'default',
    isHidden: false,
    label: '13Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '2',
    target: '103',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },
  {
    id: 'edge-3-104',
    type: 'default',
    isHidden: false,
    label: '14Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '3',
    target: '104',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },
  {
    id: 'edge-103-4',
    type: 'default',
    isHidden: false,
    label: '15Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '103',
    target: '4',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },
  {
    id: 'edge-104-4',
    type: 'default',
    isHidden: false,
    label: '15Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '104',
    target: '4',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },
  {
    id: 'edge-4-105',
    type: 'default',
    isHidden: false,
    label: '15Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '4',
    target: '105',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },
  {
    id: 'edge-105-5',
    type: 'default',
    isHidden: false,
    label: '15Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '105',
    target: '5',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },
  {
    id: 'edge-5-106',
    type: 'default',
    isHidden: false,
    label: '15Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '5',
    target: '106',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },
  {
    id: 'edge-103-5',
    type: 'default',
    isHidden: false,
    label: '15Hz',
    labelStyle: {fill: 'white'},
    labelBgStyle: {fill: 'rgba(0,0,0,0)'},
    source: '103',
    target: '5',
    animated: true,
    arrowHeadType: ArrowHeadType.ArrowClosed,
  },
]
```

Which is a combination of nodes and topics with edges connecting them.

## 2022-03-13

Today, I have added linting and formatting, fixed the package name and description, and added a newer dataset in the new format.
The next steps are to adjust the program to use the new data structures.

It seems that there are several events and that they can be added in any order. It also is the case that the namespace of the node should be considered in creating the mapped topic. The data structure will have nodes, which have a namespace and id; it will have topics, which have a topic and node id.

## 2021-11-12

### Results

Today I refactored the example from Foxglove to be a class. I also exposed
preview time and the `allFrames` property, which gives me access to all of the
messages in a bag. Next, I'll be working on using the `allFrames` property to
scrub to arbitrary locations in the bag. This will require having two pipelines
for updates:

1. A pipeline that updates nodes as messages come in.
2. A pipeline that gets all messages between the start and a current play time
   and uses that to build an idea of what nodes are around. After this is built,
   when the user is playing the bag file, we can go back to method one. For
   efficiency, it might actually be good to take the difference between the
   current play time and the preview time so that I can remove messages that
   occurred in the time, rather than going from zero.

## 2021-11-13

Today I am going to try to use the `allFrames` property to scrub to arbitrary
time in the bag. This will require moving some of the logic in the node viewer
into the example panel class. It makes sense to put it there, as it is really
where the state should be.

### Results

I got scrubbing working! One thing that I notice is that if the bag loops or I
restart the bag, the system's state keeps going and thus it is not correct. I
can fix this by scrubbing again, but this is not desirable. I should probably
ask the Foxglove guys how to solve this.
