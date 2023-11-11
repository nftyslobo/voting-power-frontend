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
  PageButtons,
} from "@ensdomains/thorin";
import { useEnsName, useBlockNumber, useEnsAddress } from "wagmi";
import { fetchEnsAddress } from "@wagmi/core";
import { useSearchParams } from "react-router-dom";

function App() {
  const defaultAddress = "0x2B888954421b424C5D3D9Ce9bB67c9bD47537d12";
  const [searchParams] = useSearchParams();
  const validTokens = ["ens", "gtc", "arb", "op", "uni"];
  const defaultDao = "ens";

  // Function to parse URL parameters
  function parseURLParams(searchParams) {
    const addressFromURL = searchParams.get("address");
    const tokenFromURL = searchParams.get("token");

    const address =
      addressFromURL &&
      addressFromURL.length === 42 &&
      addressFromURL.startsWith("0x")
        ? addressFromURL
        : defaultAddress;
    const dao = validTokens.includes(tokenFromURL?.toLowerCase())
      ? tokenFromURL.toLowerCase()
      : defaultDao;

    return { address, dao };
  }

  // Extracted URL parameters for initial state
  const { address, dao: initialDao } = parseURLParams(searchParams);

  const [wallet, setWallet] = useState(address);
  const [dao, setDao] = useState(initialDao);

  const [walletData, setWalletData] = useState([]);

  const [topDelegates, setTopDelegates] = useState([]);

  const [delegations, setDelegations] = useState("0");
  const [votingPower, setVotingPower] = useState("0");
  const userSearchInputRef = useRef(null);

  const [showZeroBalance, setShowZeroBalance] = useState(false);
  const [dataBlock, setDataBlock] = useState("");
  // const daoSelectionClass =
  //   dao === "ens" ? "delegate-card-ens" : "delegate-card-gtc";
  const [delegatePage, setDelegatePage] = useState(1);

  const [showHistoricDelegators, setShowHistoricDelegators] = useState(false);

  useEffect(() => {
    // Handle wallet address
    const addressFromURL = searchParams.get("address");
    if (
      addressFromURL &&
      addressFromURL.length === 42 &&
      addressFromURL.startsWith("0x")
    ) {
      setWallet(addressFromURL);
    }

    // Handle dao token
    const tokenFromURL = searchParams.get("token");
    const validTokens = ["ens", "gtc", "arb", "op", "uni"];
    if (tokenFromURL && validTokens.includes(tokenFromURL.toLowerCase())) {
      setDao(tokenFromURL.toLowerCase());
    }
  }, [searchParams]);

  async function handleClick() {
    const { value } = userSearchInputRef.current;
    setDelegatePage(1);

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
    console.log("go");
    fetch("https://api.votingpower.xyz/top-delegates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dao: dao,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTopDelegates(data);
      });
  }, [dao]);

  useEffect(() => {
    console.log(dao);
    fetch("https://api.votingpower.xyz/delegation-details", {
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

    fetch("https://api.votingpower.xyz/get-vp", {
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

    fetch("https://api.votingpower.xyz/get-delegations", {
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

    fetch("https://api.votingpower.xyz/latest_block/ens")
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
      <div className="back-splash-color"></div>
      <div className="back-splash-grid"></div>
      <div className="main-content">
        <header className="header">
          <h1 align="center">Voting Power</h1>
          <h2 align="center">Explore delegate's delegators</h2>
        </header>
        <div className="top-delegators-container">
          <TabContainer activeTab={dao} setActiveTab={setDao} />
          <TableTopDelegates
            dao={dao}
            topDelegates={topDelegates}
            setAddress={setWallet}
            setDelegatePage={setDelegatePage}
          />
        </div>{" "}
        <div className="delegate-results-card-container">
          <div className="delegate-card">
            <div className="avatar">
              <GetAvatar address={wallet} />
            </div>
            <div className="delegate-details">
              <GetEns address={wallet} cn="delegate-name" />
              <div>
                {<FlameSVG />} {formatNumber(votingPower)}
              </div>
              <div>Delegations: {formatNumber(delegations)}</div>
            </div>
            <div className="vote-distribution-container-desktop">
              <VoteDistribution walletData={walletData} />
            </div>
          </div>
          <div className="vote-distribution-container-mobile">
            <VoteDistribution walletData={walletData} />
          </div>
        </div>
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
              color="white"
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
          <TabContainer activeTab={dao} setActiveTab={setDao} />
          <DelegateTable
            walletData={walletData}
            updatedAs={dataBlock}
            dao={dao}
            showHistoricDelegators={showHistoricDelegators}
            setDelegatePage={setDelegatePage}
            delegatePage={delegatePage}
          />
        </div>
      </div>
      <div> {/* <LatestBlockInfo /> */}</div>
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

export function AddressTooltip(props) {
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
        <AddressTooltip tooltipText={address}>
          <div className={cn}>{data}</div>
        </AddressTooltip>
      ) : (
        <AddressTooltip tooltipText={address}>
          <span>{truncatedAddress}</span>
        </AddressTooltip>
      )}
    </div>
  );
};

export const GetAvatar = ({ address }) => {
  const { data, isError, isLoading } = useEnsName({
    address: address,
  });

  return (
    <div>
      <Avatar
        src={"https://metadata.ens.domains/mainnet/avatar/" + data}
        shape="circle"
      />
    </div>
  );
};

export function DelegateTable(props) {
  const { data: currentBlock, isError, isLoading } = useBlockNumber();

  const itemsPerPage = 10;
  const totalItems = props.walletData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (props.delegatePage - 1) * itemsPerPage;
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
              <th>
                {props.showHistoricDelegators
                  ? "Switched To"
                  : "Prior Delegate"}
              </th>
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
                    {props.showHistoricDelegators ? (
                      <GetEns address={data.delegate} />
                    ) : data.fromDelegate ===
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
            current={props.delegatePage}
            total={totalPages}
            onChange={(value) => props.setDelegatePage(value)}
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
      <button
        className={`tab ${activeTab === "arb" ? "active" : ""}`}
        id="arb"
        onClick={() => handleTabClick("arb")}
      >
        ARB
      </button>
      <button
        className={`tab ${activeTab === "uni" ? "active" : ""}`}
        id="uni"
        onClick={() => handleTabClick("uni")}
      >
        UNI
      </button>
      <button
        className={`tab ${activeTab === "op" ? "active" : ""}`}
        id="op"
        onClick={() => handleTabClick("op")}
      >
        OP
      </button>
    </div>
  );
}

export function TableTopDelegates(props) {
  const [currentPage, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalItems = props.topDelegates.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const visibleData = props.topDelegates.slice(startIndex, endIndex);

  const emptyRows = Array(itemsPerPage - visibleData.length).fill(null);

  return (
    <>
      <div className="top-delegators-table">
        <table>
          <caption>Top 50</caption>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Delegate</th>
              <th>Voting Power</th>
              <th>Delegations</th>
            </tr>
          </thead>
          <tbody>
            {visibleData.map((data, key) => {
              return (
                <tr key={key}>
                  <td>{data.rank}</td>
                  <td
                    align="left"
                    onClick={() => {
                      props.setAddress(data.delegate);
                      props.setDelegatePage(1);
                    }}
                  >
                    <GetEns address={data.delegate} />
                  </td>
                  <td align="right">{formatNumber(data.votingPower)}</td>
                  <td align="right"> {formatNumber(data.delegations)}</td>
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
        <div className="table-pagination pagination-delegators">
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

export function VoteDistribution(props) {
  const { walletData: data } = props;

  if (!data || data.length === 0) {
    // Return an empty div if there is no data
    return <div></div>;
  }

  const formatDelegatorBalance = (balance) => {
    if (balance > 500) {
      return `${(balance / 1000).toFixed(1)}k`;
    } else {
      return balance;
    }
  };

  const totalDelegatorBalance = data.reduce(
    (total, item) => total + (item?.delegator_balance || 0),
    0
  );

  const firstThreeEntries = data.slice(0, 3);
  const otherEntries = data.slice(3);

  const dividedBalances = firstThreeEntries.map(
    (item) => (item?.delegator_balance || 0) / totalDelegatorBalance
  );

  const remainingVoteShare =
    1 - dividedBalances.reduce((total, balance) => total + balance, 0);
  const otherTotalBalance = otherEntries.reduce(
    (total, item) => total + (item?.delegator_balance || 0),
    0
  );

  const result = [...dividedBalances, remainingVoteShare];

  const barGraphWidth = 275;

  const legendLabels = ["1st", "2nd", "3rd", "Other"];

  const largestSectionIndex = result.indexOf(Math.max(...result));

  const colors = ["#3888ff", "#ffaf38", "#9cc4ff", "#fbd975"];

  return (
    <div>
      <p align="center">Voting Power Distribution</p>
      <div className="bar-graph-container">
        {result.map((value, index) => (
          <div
            className="bar-graph-item"
            key={index}
            style={{
              backgroundColor: colors[index],
              width: `${value * barGraphWidth}px`,
              color: index === largestSectionIndex ? "white" : "transparent",
            }}
          >
            {index === largestSectionIndex &&
              (index < 3
                ? formatDelegatorBalance(
                    firstThreeEntries[index]?.delegator_balance || 0
                  )
                : formatDelegatorBalance(otherTotalBalance))}
          </div>
        ))}
      </div>
      <div className="bar-graph-legend-container">
        {legendLabels.map((label, index) => (
          <div className="bar-graph-legend-text" key={index}>
            <div
              className="bar-graph-legend-color-block"
              style={{
                backgroundColor: colors[index],
              }}
            >
              {result[index] >= 0.01 &&
                !isNaN(result[index]) &&
                result[index] <= 0.99 &&
                `${Math.round(result[index] * 100)}%`}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// const LatestBlockInfo = () => {
//   const [latestBlocks, setLatestBlocks] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Replace 'http://localhost:5000' with the base URL of your Flask API if it's different
//     fetch("/latest-block")
//       .then((response) => {
//         if (!response.ok) {
//           // If the response is not 2xx, throw an error
//           throw new Error(`HTTP error status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then((data) => {
//         setLatestBlocks(data);
//         setIsLoading(false);
//       })
//       .catch((error) => {
//         setError(error);
//         setIsLoading(false);
//       });
//   }, []);

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error.message}</div>;
//   }

//   return (
//     <div className="footer">
//       <ul>
//         {latestBlocks.map((block, index) => (
//           <li key={index}>
//             {block[0]}:{formatNumber(block[1])}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };
