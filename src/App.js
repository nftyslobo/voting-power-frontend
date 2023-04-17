import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Input,
  Checkbox,
  Avatar,
  FlameSVG,
  CopySVG,
  CheckSVG,
  MagnifyingGlassSimpleSVG,
  Heading,
  PageButtons,
} from "@ensdomains/thorin";
import { useEnsName, useBlockNumber, useEnsAddress } from "wagmi";
import { fetchEnsAddress } from "@wagmi/core";

function App() {
  const [walletData, setWalletData] = useState([
    {
      delegator: "0xC9E23b023bA23f48B26251B5Fa57FEae1f18B844",
      delegator_balance: 0.0,
      blockNumber: 16813786,
      fromDelegate: "0xC9E23b023bA23f48B26251B5Fa57FEae1f18B844",
      current: true,
    },
    {
      delegator: "0xBC2E26deD32A96911B65EE2283a1E30F077BbC59",
      delegator_balance: 0.0372218033,
      blockNumber: 16796720,
      fromDelegate: "0x0000000000000000000000000000000000000000",
      current: true,
    },
    {
      delegator: "0x77e8f1728941eE3aF1296bDd9C10d8b7c0b20061",
      delegator_balance: 0.0,
      blockNumber: 16675361,
      fromDelegate: "0x0000000000000000000000000000000000000000",
      current: true,
    },
  ]);
  const [wallet, setWallet] = useState(
    "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12"
  );

  const [delegations, setDelegations] = useState("0");
  const [votingPower, setVotingPower] = useState("0");
  const userSearchInputRef = useRef(null);
  const [dao, setDao] = useState("ens");
  const [showZeroBalance, setShowZeroBalance] = useState(false);
  const [dataBlock, setDataBlock] = useState("");
  const daoSelectionClass =
    dao === "ens" ? "delegate-card-ens" : "delegate-card-gtc";

  const [showHistoricDelegators, setShowHistoricDelegators] = useState(false);

  async function handleClick() {
    const { value } = userSearchInputRef.current;

    if (value.length == 42) {
      setWallet(value);
    } else if (value.includes(".")) {
      const address = await fetchEnsAddress({
        name: value,
      });

      setWallet(address);
    } else {
      console.log("this is an error");
    }
  }

  const handleKeypress = (e) => {
    //it triggers by pressing the enter key
    if (e.keyCode === 13) {
      handleClick();
    }
  };

  useEffect(() => {
    fetch("https://votingpower.xyz/delegate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: wallet,
        showzerobalance: showZeroBalance,
        dao: dao,
        showhistoric: showHistoricDelegators,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setWalletData(data);
      });

    fetch("https://votingpower.xyz/voting-power", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: wallet,
        dao: dao,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setVotingPower(data);
      });

    fetch("https://votingpower.xyz/delegations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: wallet,
        showzerobalance: showZeroBalance,
        dao: dao,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setDelegations(data);
      });

    // fetch("/delegations/" + wallet + "?showzerobalance=" + showZeroBalance)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     setDelegations(data);
    //   });

    // fetch("/voting-power/" + wallet)
    //   .then((res) => res.json())
    //   .then((data) => {
    //     setVotingPower(data);
    //   });

    fetch("https://votingpower.xyz/latest_block/ens")
      .then((res) => res.json())
      .then((data) => {
        setDataBlock(data);
        console.log(data);
      });
  }, [wallet, showZeroBalance, showHistoricDelegators, dao]);

  function handleChange(event) {
    if (event.target.checked) {
      //console.log("✅ Checkbox is checked");
    } else {
      //console.log("⛔️ Checkbox is NOT checked");
    }

    setShowZeroBalance((current) => !current);
  }

  return (
    <div className="wrapper">
      <header className="header">
        <Heading align="center">Voting Power</Heading>

        <TabContainer activeTab={dao} setActiveTab={setDao} />
      </header>
      <div className="main-content">
        <div className="search-container">
          <div className="search-bar">
            <Input
              ref={userSearchInputRef}
              type="text"
              id="message"
              name="message"
              label="Wallet Address"
              prefix={<MagnifyingGlassSimpleSVG />}
              placeholder="slobo.eth or 0xa023…251e"
              onKeyDown={handleKeypress}
              spellCheck="false"
            />
          </div>
          <div className="search-button">
            <Button onClick={handleClick}>Search</Button>
          </div>
          <div className="search-checkbox">
            <Checkbox
              type="checkbox"
              value={showZeroBalance}
              onChange={handleChange}
              id="zero-balance"
              name="zero-balance"
              label="Show Zero Balance"
            />
          </div>
          <div className="search-checkbox">
            <Checkbox
              type="checkbox"
              value={showHistoricDelegators}
              onChange={() =>
                setShowHistoricDelegators(!showHistoricDelegators)
              }
              id="prior-delegations"
              name="prior-delegations"
              label="Historic Delegators Only"
            />
          </div>
        </div>
        {/* Delegate Results */}
        <div className="delegate-results-container">
          <div className={`delegate-card ${daoSelectionClass}`}>
            <div className="avatar">
              <GetAvatar address={wallet} />
            </div>
            <div className="delegate-details">
              <GetEns address={wallet} cn="delegate-name" />
              <div>
                {<FlameSVG />} {formatNumber(votingPower)}
              </div>
              <div>Delegations: {delegations}</div>
            </div>
          </div>
          <Table walletData={walletData} updatedAs={dataBlock} dao={dao} />
        </div>
      </div>
    </div>
  );
}

export default App;

export function formatNumber(number) {
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function Tooltip(props) {
  const [isCopySuccess, setIsCopySuccess] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(props.tooltipText).then(() => {
      setIsCopySuccess(true);
      setTimeout(() => {
        setIsCopySuccess(false);
      }, 2000);
    });
  }
  return (
    <div className="tooltip">
      {props.children}
      <span className="tooltiptext">
        {props.tooltipText}
        <button className="copy-button" onClick={copyToClipboard}>
          {isCopySuccess ? <CheckSVG /> : <CopySVG />}
        </button>
      </span>
    </div>
  );
}

export function truncateAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const GetEns = ({ address, cn }) => {
  const { data, isError, isLoading } = useEnsName({
    address: address,
  });

  const truncatedAddress = truncateAddress(address.toLowerCase());

  if (isLoading) return <div>{truncatedAddress}</div>;
  if (isError) return <div>Error fetching name</div>;
  return (
    <div>
      {data ? (
        <Tooltip tooltipText={address}>
          <div className={cn}>{data}</div>
        </Tooltip>
      ) : (
        <Tooltip tooltipText={address}>
          <span>{truncatedAddress}</span>
        </Tooltip>
      )}
    </div>
  );
};

export const GetAvatar = ({ address }) => {
  const { data, isError, isLoading } = useEnsName({
    address: address,
  });
  console.log("get avatar: " + data);

  return (
    <div>
      <Avatar
        src={"https://metadata.ens.domains/mainnet/avatar/" + data}
        shape="circle"
      />
    </div>
  );
};

export function Table(props) {
  const { data: currentBlock, isError, isLoading } = useBlockNumber();

  const [currentPage, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = props.walletData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const visibleData = props.walletData.slice(startIndex, endIndex);

  const emptyRows = Array(itemsPerPage - visibleData.length).fill(null);

  return (
    <>
      {/* <div>
        {props.dao.toUpperCase()} As Of: {formatNumber(props.updatedAs)}{" "}
        current: {currentBlock ? formatNumber(currentBlock) : "Loading..."}
      </div> */}
      <div className="table-results">
        <table>
          <thead>
            <tr>
              <th>Delegator</th>
              <th>Token Balance</th>
              <th>Block Delegated</th>
              <th>Prior Delegate</th>
            </tr>
          </thead>
          <tbody>
            {visibleData.map((data, key) => {
              return (
                <tr key={key}>
                  <td>
                    <GetEns address={data.delegator} />
                  </td>
                  <td align="right">{formatNumber(data.delegator_balance)}</td>
                  <td align="right">{formatNumber(data.blockNumber)}</td>
                  <td align="right">
                    {data.fromDelegate ===
                    "0x0000000000000000000000000000000000000000" ? (
                      "None"
                    ) : (
                      <GetEns address={data.fromDelegate} />
                    )}
                  </td>
                </tr>
              );
            })}
            {emptyRows.map((_, index) => (
              <tr key={`empty-${index}`}>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-pagination">
          <PageButtons
            alwaysShowFirst
            alwaysShowLast
            current={currentPage}
            total={totalPages}
            onChange={(value) => setPage(value)}
            max="5"
          />
        </div>
      </div>
    </>
  );
}

export function TabContainer({ activeTab, setActiveTab }) {
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="tab-container">
      <button
        className={`tab ${activeTab === "ens" ? "active" : ""}`}
        id="ens"
        onClick={() => handleTabClick("ens")}
      >
        ENS
      </button>
      <button
        className={`tab ${activeTab === "gtc" ? "active" : ""}`}
        id="gtc"
        onClick={() => handleTabClick("gtc")}
      >
        GTC
      </button>
    </div>
  );
}
