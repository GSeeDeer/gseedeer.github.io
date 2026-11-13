# Getting Started with Bluetooth Protocols


## 1. A Brief History of Bluetooth

Bluetooth is a wireless communication standard that lets fixed and mobile devices exchange data over short distances and form a personal area network (PAN). It uses short-wavelength UHF radio waves in the 2.4–2.485 GHz ISM band. Ericsson, a telecommunications company, developed the technology in 1994. The original goal was to create a wireless replacement for RS-232 data cables. Bluetooth can connect multiple devices and overcome synchronization issues.

The Bluetooth SIG (Special Interest Group) maintains the standard. It has more than 30,000 member companies across telecommunications, computing, networking, and consumer electronics. The IEEE once standardized Bluetooth as IEEE 802.15.1, but that standard is no longer maintained.

**Technology types: Bluetooth has two technology types: Basic Rate/Enhanced Data Rate (BR/EDR) and Low Energy (LE). BR/EDR uses a point-to-point topology for one-to-one device communication. LE supports point-to-point (one-to-one), broadcast (one-to-many), and mesh (many-to-many) topologies.**

The [Bluetooth SIG](https://www.bluetooth.com/) owns the Bluetooth trademark, develops the specifications, certifies manufacturers, and licenses the use of Bluetooth technology and trademarks. It does not design, manufacture, or sell Bluetooth devices itself.

### 1.2 Bluetooth 2.x + EDR

Bluetooth 2.0 + EDR introduced the "non-hopping narrowband channel." Because it does not require an acknowledgement exchange with every device, this channel can broadcast various Bluetooth service profiles to a large number of Bluetooth devices at once. The acknowledgement exchange currently takes about one second. Unencrypted information such as real-time public transport timetables, basic traffic conditions, and advanced traffic directions can be sent to devices at high speed. It also supports higher connection speeds and multiple speed levels.

On July 26, 2007, the Bluetooth SIG adopted Bluetooth Core Specification 2.1 + EDR. It is fully backward compatible with version 1.2 and adds Sniff power-saving, which extends the contact interval between an adapter and a device to 0.5 seconds and can save a noticeable amount of power. It also adds Secure Simple Pairing (SSP), which improves the pairing experience and increases security.

### 1.3 Bluetooth 3.0 + HS

On April 21, 2009, the Bluetooth SIG released Bluetooth Core Specification 3.0 (3.0 + HS), which introduced a new alternate RF technology. **Bluetooth 3.0 + HS increased data transfer rates**, and with 802.11 PAL it can reach a maximum speed of **24 Mbps**, eight times the speed of Bluetooth 2.0. It also introduced enhanced power control, significantly reducing idle power consumption.

### 1.4 Bluetooth 4.x

Bluetooth 4.0 differs from the mainstream Bluetooth 2.x + EDR and the not-yet-widespread Bluetooth 3.0 + HS in its protocol composition. Bluetooth 4.0 is the only comprehensive protocol specification in Bluetooth's history and defines three modes: Bluetooth Low Energy, Classic Bluetooth, and High Speed Bluetooth.

- High Speed Bluetooth: focused on data exchange and transfer.
- Classic Bluetooth: focused on information exchange and device connections.
- Bluetooth Low Energy: focused on connections for devices that do not need much bandwidth. Its predecessor was Wibree, developed by Nokia as an extremely low-power mobile wireless communication technology. After the SIG adopted and standardized it, it was renamed Bluetooth Low Energy (BLE).

These three specifications can be combined to enable a wider range of applications. Bluetooth 4.0 also extends the transmission range to more than 100 meters in low-energy mode.

Bluetooth 4.0 defines Single mode and Dual mode. Single mode can communicate only with Bluetooth 4.0 and is not backward compatible with 3.0/2.1/2.0. Dual mode is backward compatible and can communicate with both Bluetooth 4.0 and 3.0/2.1/2.0 devices.

Frequency hopping: Bluetooth uses adaptive frequency hopping across all specification versions to minimize interference with other 2.4 GHz ISM-band wireless technologies.

At the end of 2013, the Bluetooth SIG released Bluetooth 4.1, aiming to make Bluetooth Smart a core driver of the Internet of Things (IoT).

In December 2014, the Bluetooth SIG released Bluetooth 4.2.

### 1.5 Bluetooth 5.x

Bluetooth 5.0 was released in June 2016. It offers four times the range and twice the speed of Bluetooth 4.2 LE (up to 24 Mbps). Bluetooth 5.0 also supports indoor positioning and navigation (combined with Wi-Fi, it can achieve indoor positioning accuracy of less than one meter) and allows devices to receive beacon data without pairing, such as advertisements, beacons, and location information, with an eightfold increase in throughput. It also includes many low-level optimizations for IoT.

In January 2019, the Bluetooth SIG released Bluetooth 5.1.

In January 2020, the Bluetooth SIG released Bluetooth 5.2.

### 1.6 Summary

- Bluetooth 4.0 is not the same as BLE. BLE is only a subset of Bluetooth 4.0; Bluetooth 4.0 is a comprehensive protocol specification.
- Since Bluetooth 4.0, the technology has been divided into **Bluetooth Low Energy** (BLE) and **Classic Bluetooth** (BR/EDR). Most chips on the market support only BLE, while some support both (dual-mode Bluetooth chips).
- Three functional configurations of Bluetooth chips:

    ![Bluetooth chip configurations](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220317143820174.png)

## 2. The Bluetooth Protocol Stack

The Bluetooth protocol stack consists of three major parts: **Host + optional HCI + Controller**. Single-chip solutions do not use HCI.

- Host: The host consists of the core protocols (L2CAP, SDP, SMP, ATT) and core specifications (GAP, GATT).
- Controller: This part is divided into Bluetooth Low Energy **(Vol 6: Low Energy Controller)** and Classic Bluetooth **(Vol 2: BR/EDR Controller)**.
- HCI: Defines the interface standard between the host and the controller **(Vol 4: Host Controller Interface)**. It can use UART, USB, or other transports.

![Bluetooth protocol stack](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220317152528059.png)

In the figure above, red indicates required BR/EDR Classic Bluetooth components, green indicates required LE components, and blue indicates shared components. Classic Bluetooth can also implement the green features. The HCI interface depends on the chip architecture and is optional. The figure does not show the physical-layer differences between the two technologies; this is outside chip design and can be ignored for now.

1. **GAP (Generic Access Profile)**: Defines the basic functions of all Bluetooth devices, including device discovery, connection, pairing, and bonding procedures; the four Bluetooth device roles; the format of advertising and scan response packets; and common Bluetooth parameters such as device address, name, pairing keys, and appearance, which identify whether a device is a phone or a computer. It also specifies the basic requirements for a BLE device, including which layers it must contain and how they work together.
    - Defines four Bluetooth device roles: broadcaster, observer, peripheral, and central. A broadcaster must be able to send advertising packets but may have no receiver, such as a beacon sensor. An observer must be able to receive packets from broadcasters but may have no transmitter; in practice, such devices are rare. A peripheral uses connectable advertising events to establish a link-layer connection and becomes a slave after connecting; it must be able to both receive and transmit. A central receives a connectable advertising packet from a peripheral and can initiate a connection; after connecting, it becomes a master and must be able to both receive and transmit.
    - Defines common Bluetooth parameters: Bluetooth device address, device name, pairing key, and appearance value (used to identify whether a device is a phone or a computer).
    - For more details, see **in the Core_v4.2.pdf** the `Part C: Generic Access Profile` chapter, which compares the GAP specifications for Classic Bluetooth and BLE.
2. **ATT (Attribute Protocol)**: Defines a set of rules for accessing data on a peer device. It is the foundation of GATT and a cornerstone of BLE. It defines the attribute message format and message types used by the host.
    1. Requests: Sent by a client to a server and require a Response. (C->S, acknowledged request)
    2. Responses: Sent by a server in response to a client Request.
    3. Commands: Sent by a client to a server and do not require a response.
    4. Notifications: Sent by a server to a client without a response.
    5. Indications: Similar to Notifications, but the client must send Confirmations to acknowledge receipt.
    6. Confirmations: Paired with Indications.
3. **GATT (Generic Attribute Profile)**: Built on top of ATT, GATT defines attribute types and how they are used. It standardizes the data content of attributes and uses the concept of groups to classify and manage attributes. **Without GATT, a BLE protocol stack can still run, but interoperability becomes a problem.**
4. **L2CAP (Logical Link Control and Adaptation Protocol)**: Hides many controller transport details from higher layers, simplifies higher-layer protocol development, and provides segmentation and reassembly (SAR), flow control, retransmission, and message integrity checks.

    ![L2CAP](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/1642822980936-9802828a-804f-41bd-9901-c8bc0c09dd57.png)
5. **SMP (Security Manager Protocol)**: Defines security operations such as pairing, authentication, and encryption for Bluetooth devices.
6. **LLCP/LL (Link Layer Control)**: For BLE, see **in the Core_v4.2.pdf** the `Part B: Link Layer Specification` chapter.
7. **PHY (Physical Layer)**: BLE uses 40 channels divided into data channels and advertising channels. Three channels are advertising channels, used for device discovery, connection establishment, and advertising data. The other 37 are data channels, used for data communication between connected devices. Two connected devices must use the same channel at the same time to communicate.

    ![BLE channels](https://bucket-220516.oss-cn-hangzhou.aliyuncs.com/img/image-20220317161753050.png)

## 3. Learning Path

> This section gives a basic learning path for BLE. It may not suit everyone; feel free to discuss it in the comments.

Core idea: learn by asking questions, such as "How do BLE devices establish a connection?" and "What is the connection keep-alive mechanism in BLE?"

1. Build a basic understanding of the protocol stack, its components, and the terminology, and form an overall picture.
2. Analyze packet captures from real projects and connect theory with observed behavior for each procedure, such as BLE advertising and connection establishment. If possible, get a development board with matching tutorial code that you can run directly.
3. Port and study a protocol stack implementation. `Zephyr` is recommended.

## 4. Protocol Documents

1. Official Bluetooth SIG download page: [www.bluetooth.com](http://www.bluetooth.com/)
2. Personal cloud drive share: [https://www.aliyundrive.com/s/dhKyoDvENGY](https://www.aliyundrive.com/s/dhKyoDvENGY)

