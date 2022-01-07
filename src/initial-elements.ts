// Copyright 2021 Open Source Robotics Foundation, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Elements, Position, XYPosition, ArrowHeadType } from 'react-flow-renderer';

const position: XYPosition = { x: 0, y: 0 };

const initialElements: Elements = [
  // Nodes
  {
    id: '1',
    isHidden: false,
    type: 'input',
    data: { label: 'stereo_camera_controller' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },
  {
    id: '2',
    isHidden: false,
    data: { label: 'image_adjuster_left_stereo' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },
  {
    id: '3',
    isHidden: false,
    data: { label: 'image_adjuster_right_stereo' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },
  {
    id: '4',
    isHidden: false,
    data: { label: 'disparity_node' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },
  {
    id: '5',
    isHidden: false,
    data: { label: 'point_cloud_node' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },
  {
    id: '6',
    isHidden: false,
    data: { label: '_a_hidden_node' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },

  // Topics
  {
    id: '101',
    isHidden: false,
    data: { label: 'T: /viper/NavCamStereo/left/image_raw' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },
  {
    id: '102',
    isHidden: false,
    data: { label: 'T: /viper/NavCamStereo/right/image_raw' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },
  {
    id: '103',
    isHidden: false,
    data: { label: 'T: /viper/NavCamStereo/left/image_raw/adjusted_stereo' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },
  {
    id: '104',
    isHidden: false,
    data: { label: 'T: /viper/NavCamStereo/right/image_raw/adjusted_stereo' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },
  {
    id: '105',
    isHidden: false,
    data: { label: 'T: /viper/NavCamStereo/disparity' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },
  {
    id: '106',
    isHidden: false,
    data: { label: 'T: /viper/NavCamStereo/points2' },
    position,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    style: { width: 175, height: 40 },
  },

  // Edges
  {
    id: 'edge-1-101',
    isHidden: false,
    label: '10Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '1',
    target: '101',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },
  {
    id: 'edge-1-102',
    isHidden: false,
    label: '10Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '1',
    target: '102',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },

  {
    id: 'edge-101-2',
    isHidden: false,
    label: '11Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '101',
    target: '2',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },
  {
    id: 'edge-102-3',
    isHidden: false,
    label: '12Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '102',
    target: '3',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },
  {
    id: 'edge-2-103',
    isHidden: false,
    label: '13Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '2',
    target: '103',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },
  {
    id: 'edge-3-104',
    isHidden: false,
    label: '14Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '3',
    target: '104',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },
  {
    id: 'edge-103-4',
    isHidden: false,
    label: '15Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '103',
    target: '4',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },
  {
    id: 'edge-104-4',
    isHidden: false,
    label: '15Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '104',
    target: '4',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },
  {
    id: 'edge-4-105',
    isHidden: false,
    label: '15Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '4',
    target: '105',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },
  {
    id: 'edge-105-5',
    isHidden: false,
    label: '15Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '105',
    target: '5',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },
  {
    id: 'edge-5-106',
    isHidden: false,
    label: '15Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '5',
    target: '106',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },
  {
    id: 'edge-103-5',
    isHidden: false,
    label: '15Hz',
    labelStyle: { fill: 'white' },
    labelBgStyle: { fill: 'rgba(0,0,0,0)' },
    source: '103',
    target: '5',
    type: 'default',
    animated: true,
    arrowHeadType: ArrowHeadType.Arrow
  },
];

export default initialElements;
