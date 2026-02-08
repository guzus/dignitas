// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DignitasProtocol - On-chain reputation layer for AI agents
/// @notice Handles agent registration, query payments, agent-to-agent payments,
///         and interaction recording on Base Sepolia
contract DignitasProtocol {
    address public owner;
    address public treasury;
    uint256 public queryPrice;

    struct AgentInfo {
        string name;
        string description;
        bool registered;
        uint256 totalReceived;
        uint256 totalSent;
        uint256 interactionCount;
    }

    mapping(address => AgentInfo) public agents;
    address[] public registeredAgents;

    event AgentRegistered(address indexed agent, string name, string description);
    event QueryPaid(address indexed payer, uint256 amount, bytes32 indexed paymentId);
    event AgentPaid(address indexed from, address indexed to, uint256 amount);
    event InteractionRecorded(
        address indexed from,
        address indexed to,
        string interactionType,
        bytes32 indexed txRef
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _treasury, uint256 _queryPrice) {
        owner = msg.sender;
        treasury = _treasury;
        queryPrice = _queryPrice;
    }

    /// @notice Register or update an agent's on-chain profile
    function registerAgent(string calldata _name, string calldata _description) external {
        if (!agents[msg.sender].registered) {
            registeredAgents.push(msg.sender);
        }
        agents[msg.sender].name = _name;
        agents[msg.sender].description = _description;
        agents[msg.sender].registered = true;
        emit AgentRegistered(msg.sender, _name, _description);
    }

    /// @notice Pay the query fee to access paid API endpoints
    /// @return paymentId Unique identifier for this payment
    function payForQuery() external payable returns (bytes32 paymentId) {
        require(msg.value >= queryPrice, "Insufficient payment");
        paymentId = keccak256(
            abi.encodePacked(msg.sender, block.timestamp, block.number, msg.value)
        );
        (bool sent, ) = payable(treasury).call{value: msg.value}("");
        require(sent, "Transfer failed");
        emit QueryPaid(msg.sender, msg.value, paymentId);
    }

    /// @notice Send ETH payment directly to another agent
    function payAgent(address _to) external payable {
        require(msg.value > 0, "Must send ETH");
        require(_to != address(0), "Invalid address");
        agents[msg.sender].totalSent += msg.value;
        agents[_to].totalReceived += msg.value;
        (bool sent, ) = payable(_to).call{value: msg.value}("");
        require(sent, "Transfer failed");
        emit AgentPaid(msg.sender, _to, msg.value);
    }

    /// @notice Record an interaction between two agents on-chain
    function recordInteraction(address _to, string calldata _interactionType) external {
        agents[msg.sender].interactionCount++;
        agents[_to].interactionCount++;
        bytes32 txRef = keccak256(
            abi.encodePacked(msg.sender, _to, block.timestamp, block.number)
        );
        emit InteractionRecorded(msg.sender, _to, _interactionType, txRef);
    }

    /// @notice Get full agent info
    function getAgent(address _addr)
        external
        view
        returns (
            string memory name,
            string memory description,
            bool registered,
            uint256 totalReceived,
            uint256 totalSent,
            uint256 interactionCount
        )
    {
        AgentInfo memory a = agents[_addr];
        return (a.name, a.description, a.registered, a.totalReceived, a.totalSent, a.interactionCount);
    }

    /// @notice Get total number of registered agents
    function getAgentCount() external view returns (uint256) {
        return registeredAgents.length;
    }

    function setQueryPrice(uint256 _price) external onlyOwner {
        queryPrice = _price;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
}
