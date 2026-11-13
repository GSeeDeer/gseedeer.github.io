# SigMesh网络的基础知识


## 1. 功能概述

SigMesh 是基于低功耗蓝牙(BLE)基础之上的一种mesh网络应用层协议，数据链路层直接复用BLE的链路层，未做任何修改。对于一般的mesh网络来说，要解决的问题有以下几种：

1. mesh网络的管理：节点如何加入网络？如何离开网络？可管理最大节点数量？低功耗节点的支持 ？
2. 节点间消息的传递：
    - 节点间一对一的传输（单播）？  节点间一对多的传输（组播）？
    - 消息传输延迟，如何寻求最佳路径？
    - 可稳定传递消息的mesh网络最大距离 ？
    - 如何保证消息的可靠到达？
    - 单包消息可承载的应用报文大小 ？组包和分包的处理机制及可靠性？
3. mesh网络的安全机制保障 ？

SigMesh网络标准基于泛洪网络的机制实现，使用了BLE链路层的广播通道来传递消息，信号范围内其他节点都可接收到消息，并进行中继转发，以扩大消息传递范围。在本规范的未来修订版中，可能会考虑添加路由功能和定义基于路由的网状网络的增强功能。

- **网络风暴**：当网络节点数量不断增大时，如果任由消息的不断中继，将会使得整个网络带宽阻塞，正常消息传递无法响应；引发网络风暴，mesh网络瘫痪 ！
- **消息中继**：Sigmesh网络目前提供了两种方式来限制泛洪网络中消息的无限制中继，消息缓存和消息最大中继次数(TTL值)。
    - **网络消息缓存**：在通过将所有消息添加到缓存列表来防止设备中继以前接收到的消息。 收到消息时，会根据列表检查它，如果已经存在则忽略它。 如果尚未收到，则将其添加到缓存中，以便将来可以忽略。 为防止此列表变得过长，缓存的消息数量受实现限制。
    - **TTL**：每条消息都包含一个生存时间 (TTL) 值，该值限制了一条消息可以被中继的次数。 每次设备接收到消息然后中继（最多 126 次）时，TTL 值减 1。
- **通信支持**：现存的一些BLE设备可能不支持通过广播处理mesh消息，为了能在不升级软硬件的基础上，无缝接入mesh网络，mesh网络提供了GATT承载层的支持，可供此类设备接入，比如手机、平板等。
- **低功耗**：低功耗节点的控制报文处理通过与具备朋友特性节点建立友谊来实现。
- **节点入网**：Provisioner负责mesh网络中节点的添加和删除，Provisioning协议可通过广播承载或GATT承载实现。理论上每个节点都可作为Provisioner。

## 2. 节点的特性

Sigmesh网络中节点除了拥有最基本的消息发送和接收功能，还有一些可选的额外功能。

1. 朋友（Friend）：缓存低功耗节点未处理的消息，低功耗节点唤醒后可获取处理；节点启用朋友功能后，且与低功耗节点建立友谊关系后，便成为一个朋友节点。
2. 中继（Relay）：基于广播承载层，接收和转发mesh消息的能力，以扩大网络传输范围。
3. 代理（Proxy）：基于GATT承载和广播承载之间，接收和转发mesh消息的能力。
4. 低功耗（Low Power）：采用电池供电的节点，不会一直处于工作状态；需要接收消息时，与具备朋友能力的节点一起使用时，才能显著降低功耗。

## 3. 网络拓扑

![mesh网络拓扑](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220819104444105.png)

Figure shows three Relay nodes: Q, R, and S.

The three nodes that support the Friend feature are N, O, and P, however N does not have any friendships; therefore only O and P are Friend nodes.

There are five Low Power nodes: I, J, K, L, and M. Nodes I, J, and K have P as their friend, while L and M have O as their friend.

Node T is only connected to the mesh network using a GATT bearer; **therefore S must relay all messages to and from T**.

For example, if a message is to be sent from T to L, then T will send the message to node S using the GATT bearer. Node S will retransmit this message using the advertising bearer. Nodes H, R, N, and O are within radio range of node S; therefore they will receive this message. Node O, being the friend of node L will store the message, and if the message was a segmented message, node O will respond with an acknowledgment at the lower transport layer. Sometime later, L will poll node O to check for new messages, such that O will forward the message originally sent by T to L.

## 4. 相关概念

为更好的描述Sigmesh网络的功能和机制，Mesh标准定义了几种不同的概念；状态(states)、消息(messages)、绑定(bindings)、元素(Elements)、addressing, models, publish-subscribe, mesh keys, and associations.

- 状态(states)：A state is a value representing a condition of an element.
- Bound states ：节点内部或节点之间的一个状态联动机制，比如开关节点的开关状态联动灯节点的亮灭状态。
- 消息(messages)：mesh网络中节点节点间通过发送消息，来完成通信。

    对于某个状态，服务端会定义一系列消息供客户端使用，用来获取或改变状态。

    消息由操作码和相关参数组成；标准消息的操作码是2个字节，特殊用途的消息采用1个字节操作码，其他基于特定厂商的采用3个字节操作码。

    传输层决定了能传输消息体的大小，也可能使用分片与重组机制(SAR)；为了最大限度地提高性能并避免 SAR 的开销，设计目标是将消息放入单个段中。

    传输层不产生分包情况下，单包可供使用的消息字节数为11(包含了消息操作码)。

    传输层提供的SAR机制，可最大支持32个分包消息，当使用SAR机制时，最大支持384字节的消息传输。

    SAR机制不会带来额外的空间字节开销，10字节的消息采用单包、20字节消息采用两个分包即可。

    消息还分为需要ACK应答的消息、不需要ACK应答的消息。
- 元素(Elements)：元素是节点内的可寻址实体

    每个节点至少有一个元素，拥有的元素数量在设备入网后，便无法改变，伴随节点整个生命周期。如果因为节点固件升级元素数量被改变，必须重新入网。
- 模型(Models)：一个model定义了节点的基础功能。比如灯会有亮度model和色彩model，一个节点可能会包含多个model。

    ![概念间的包含关系](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220819100712226.png)

    标准定义了三种类型的model：Server model、Client model、Control model。
- 地址(Addresses)：

    单播地址(Unicast address)：是分配给每个元素的唯一地址，范围0x0001~0x7FFF，共32767个可用。

    虚拟地址(Virtual address)：范围0x8000 - 0xBFFF，共16384个可用。

    组包地址(Group address  )：0xFF00 - 0xFFFF 范围为固定用途的，0xC000 - 0xFEFF 为用户编程可用的地址范围。

    ![image-20220819102603601](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220819102603601.png)

## 5. 协议分层

### 5.1 Model layer(模型层)

定义了mesh网络中不同用途的节点可能用到的功能集合，每个model包含了一组组状态和消息，通过Model ID进行区分，可参考官方《Mesh Model Specification》。

### 5.2 Foundation Model layer(基础模型层)

和Model layer层类似，这里定义的是配置、管理网络相关的model.

### 5.3 Access layer(访问层)

访问层定义了高层应用程序如何使用上层传输层。访问层定义了应用数据格式、定义和控制在上层传输层执行的应用数据加密和解密。

### 5.4 Upper transport layer(上层传输层)

对于来自访问层的消息，使用 **AppKey** 执行消息的加密和认证。 这允许上层传输层验证来自网络层的消息。

上层传输层内部生成的传输控制消息仅在网络层进行加密和验证。

### 5.5 Lower transport layer(下层传输层)

在需要时，下层传输层处理 PDU 的分段和重组。

![分包与重组示例](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220820104739167.png)

### 5.6 Network layer(网络层)

网络层采用 **NetKey** 加密和解密数据，节点消息的转发也由网络层实现，网络消息缓存机制也在网络层实现。

![网络层PDU格式](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220820104551095.png)

