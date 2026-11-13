# SigMesh Network Fundamentals


## 1. Feature Overview

SigMesh is a mesh network application-layer protocol built on top of Bluetooth Low Energy (BLE). It reuses the BLE link layer directly without any modification. A general mesh network needs to solve the following problems:

1. Mesh network management: How do nodes join or leave the network? What is the maximum number of nodes? Are low-power nodes supported?
2. Message delivery between nodes:
    - One-to-one communication (unicast) and one-to-many communication (groupcast)?
    - Message latency and how to find the best path?
    - What is the maximum distance over which a mesh network can reliably deliver messages?
    - How is reliable delivery guaranteed?
    - How large can an application payload be in a single packet? How are segmentation, reassembly, and reliability handled?
3. How does the mesh network ensure security?

The SigMesh standard is based on a flooding mechanism. It uses the BLE link-layer advertising channels to deliver messages. Any node within radio range can receive a message and relay it to extend the delivery range. Future revisions of the specification may add routing and define enhancements for routing-based mesh networks.

- **Network storm**: As the number of nodes grows, unrestricted relaying can saturate the network bandwidth, preventing normal messages from being delivered and eventually causing a network storm that paralyses the mesh network.
- **Message relay**: SigMesh currently provides two mechanisms to limit unlimited relaying in a flooding network: a message cache and a maximum relay count (TTL).
    - **Message cache**: Every message is added to a cache list to prevent a device from relaying messages it has already received. When a message arrives, it is checked against the list and ignored if it is already present. Otherwise, it is added to the cache so that future copies can be ignored. To keep the list from growing indefinitely, the number of cached messages is limited by the implementation.
    - **TTL**: Every message contains a time-to-live (TTL) value that limits how many times it may be relayed. Each time a device receives and relays a message (up to 126 times), the TTL is decremented by one.
- **Communication support**: Some existing BLE devices may not support mesh messages over advertising. To allow these devices to join a mesh network without hardware or software upgrades, the mesh network provides a GATT bearer for devices such as phones and tablets.
- **Low power**: Control messages for low-power nodes are handled through a friendship with a node that supports the Friend feature.
- **Node provisioning**: The Provisioner adds and removes nodes from the mesh network. Provisioning can use either the advertising bearer or the GATT bearer. In theory, any node can act as a Provisioner.

## 2. Node Features

In addition to basic message sending and receiving, nodes in a SigMesh network can optionally provide several extra features.

1. Friend: Caches messages that a low-power node has not yet processed so that the low-power node can retrieve them after waking up. A node that enables the Friend feature and establishes a friendship with a low-power node becomes a Friend node.
2. Relay: Receives and forwards mesh messages over the advertising bearer to extend the network range.
3. Proxy: Receives and forwards mesh messages between the GATT bearer and the advertising bearer.
4. Low Power: A battery-powered node that does not stay awake continuously. When receiving messages, it can significantly reduce power consumption by working with a node that supports the Friend feature.

## 3. Network Topology

![mesh network topology](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220819104444105.png)

The figure shows three Relay nodes: Q, R, and S.

The three nodes that support the Friend feature are N, O, and P. However, N does not have any friendships; therefore only O and P are Friend nodes.

There are five Low Power nodes: I, J, K, L, and M. Nodes I, J, and K have P as their friend, while L and M have O as their friend.

Node T is connected to the mesh network only through a GATT bearer; **therefore S must relay all messages to and from T**.

For example, if a message is to be sent from T to L, T sends it to node S over the GATT bearer. Node S retransmits the message over the advertising bearer. Nodes H, R, N, and O are within radio range of S and therefore receive the message. Node O, as L's friend, stores the message. If the message is segmented, O responds with an acknowledgment at the lower transport layer. Later, L polls O for new messages, and O forwards the message originally sent by T to L.

## 4. Key Concepts

To describe the functions and mechanisms of a SigMesh network more precisely, the Mesh standard defines several concepts: states, messages, bindings, elements, addressing, models, publish-subscribe, mesh keys, and associations.

- States: A state is a value representing a condition of an element.
- Bound states: A state-binding mechanism inside a node or between nodes. For example, the switch state of a switch node can be bound to the on/off state of a light node.
- Messages: Nodes in a mesh network communicate by sending messages.

    For a given state, a server defines a set of messages that clients can use to get or change the state.

    A message consists of an opcode and related parameters. Standard messages use a 2-byte opcode, special-purpose messages use a 1-byte opcode, and vendor-specific messages use a 3-byte opcode.

    The transport layer determines the maximum message size and may use segmentation and reassembly (SAR). To maximize performance and avoid SAR overhead, the design goal is to fit a message into a single segment.

    When the transport layer does not segment a message, the application payload can contain up to 11 bytes, including the opcode.

    The SAR mechanism provided by the transport layer supports up to 32 segments and a maximum message size of 384 bytes.

    SAR does not introduce extra space overhead: a 10-byte message fits in one segment, while a 20-byte message uses two segments.

    Messages are also classified as acknowledged (ACK) and unacknowledged messages.
- Elements: An element is an addressable entity within a node.

    Every node has at least one element. The number of elements cannot change after the node is provisioned and remains fixed for the lifetime of the node. If a firmware upgrade changes the number of elements, the node must be re-provisioned.
- Models: A model defines the basic functionality of a node. For example, a light may have a brightness model and a color model, and a node may contain multiple models.

    ![relationships between concepts](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220819100712226.png)

    The standard defines three types of models: Server model, Client model, and Control model.
- Addresses:

    Unicast address: A unique address assigned to each element, ranging from 0x0001 to 0x7FFF, for a total of 32,767 addresses.

    Virtual address: Ranges from 0x8000 to 0xBFFF, for a total of 16,384 addresses.

    Group address: 0xFF00 to 0xFFFF are reserved for fixed purposes, while 0xC000 to 0xFEFF are available for user-defined group addresses.

    ![address ranges](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220819102603601.png)

## 5. Protocol Layers

### 5.1 Model layer

Defines the set of capabilities that nodes with different roles may use in a mesh network. Each model contains a set of states and messages and is identified by a Model ID. See the official Mesh Model Specification for details.

### 5.2 Foundation Model layer

Similar to the Model layer, this layer defines models related to network configuration and management.

### 5.3 Access layer

The access layer defines how higher-layer applications use the upper transport layer. It defines the application data format and controls application data encryption and decryption performed by the upper transport layer.

### 5.4 Upper transport layer

Messages from the access layer are encrypted and authenticated with the **AppKey**. This allows the upper transport layer to verify messages received from the network layer.

Transport control messages generated inside the upper transport layer are encrypted and authenticated only at the network layer.

### 5.5 Lower transport layer

When necessary, the lower transport layer handles PDU segmentation and reassembly.

![segmentation and reassembly example](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220820104739167.png)

### 5.6 Network layer

The network layer encrypts and decrypts data with the **NetKey**. It also forwards node messages and implements the network message cache.

![network layer PDU format](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220820104551095.png)

