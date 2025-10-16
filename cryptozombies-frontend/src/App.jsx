import { useEffect, useState, useCallback } from 'react'
import './App.css'
import Web3 from 'web3'
import zombieArtifact from './contracts/ZombieOwnership.json'
import kittyArtifact from './contracts/KittyCore.json'

function App() {
  const [web3, setWeb3] = useState(null)
  const [account, setAccount] = useState(null)
  const [zombieContract, setZombieContract] = useState(null)
  const [kittyContract, setKittyContract] = useState(null)
  const [zombies, setZombies] = useState([])
  const [kitties, setKitties] = useState([])
  const [name, setName] = useState('')
  const [kittyGenes, setKittyGenes] = useState('')
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState(null)
  const DEPLOYER = '0x22D0970775E3CCb1FF250f34971D01cE976b5eF2'

  const refreshZombies = useCallback(async () => {
    if (!zombieContract || !account) return
    try {
      const ids = await zombieContract.methods.getZombiesByOwner(account).call()
      const arr = []
      for (let id of ids) {
        const z = await zombieContract.methods.zombies(id).call()
        arr.push({ id, name: z.name, dna: z.dna, level: z.level })
      }
      setZombies(arr)
    } catch (err) {
      console.error('Error fetching zombies:', err)
    }
  }, [zombieContract, account])

  const refreshKitties = useCallback(async () => {
    if (!kittyContract || !account) {
      console.log('No kitty contract or account available:', { kittyContract: !!kittyContract, account })
      return
    }
    try {
      console.log('Starting to refresh kitties for account:', account)
      // Since we don't have ERC721 enumeration, we'll try getting the latest created kitty
      // and check ownership backwards until we find all owned kitties
      const arr = []
      let id = 0
      let attempts = 0
      const MAX_ATTEMPTS = 10 // Limit the number of attempts to avoid infinite loop

      while (attempts < MAX_ATTEMPTS) {
        try {
          console.log('Checking kitty ID:', id)
          const owner = await kittyContract.methods.kittyToOwner(id).call()
          console.log('Owner for kitty', id, ':', owner)
          
          if (owner.toLowerCase() === account.toLowerCase()) {
            console.log('Found owned kitty:', id)
            const kitty = await kittyContract.methods.kitties(id).call()
            console.log('Kitty details:', kitty)
            arr.push({
              id,
              genes: kitty.genes,
              generation: kitty.generation
            })
          }
          id++
          attempts++
        } catch (e) {
          console.log('Error checking kitty', id, ':', e.message)
          break
        }
      }
      console.log('Found kitties:', arr)
      setKitties(arr)
    } catch (err) {
      console.error('Error in refreshKitties:', err)
    }
  }, [kittyContract, account])

  const createZombie = useCallback(async () => {
    if (!zombieContract || !account) return
    try {
      const existingZombies = await zombieContract.methods.getZombiesByOwner(account).call()
      if (existingZombies.length > 0) {
        alert('You can only create one zombie per account. Please use a different account to create more zombies.')
        return
      }
      
      await zombieContract.methods.createRandomZombie(name || 'webzombie').send({ 
        from: account,
        gas: 300000
      })
      await refreshZombies()
    } catch (err) {
      console.error('Error creating zombie:', err)
      if (err.message.includes('revert')) {
        alert('Failed to create zombie. Each account can only create one zombie.')
      } else {
        alert('Error creating zombie. Please make sure you are connected to the correct network and have enough ETH.')
      }
    }
  }, [zombieContract, account, name, refreshZombies])

  const levelUp = useCallback(async (id) => {
    if (!zombieContract || !account || !web3) return
    try {
      await zombieContract.methods.levelUp(id).send({ 
        from: account, 
        value: web3.utils.toWei('0.001', 'ether'),
        gas: 300000
      })
      await refreshZombies()
    } catch (err) {
      console.error('Error leveling up:', err)
      alert('Failed to level up. Make sure you have enough ETH (0.001 ETH required).')
    }
  }, [zombieContract, account, web3, refreshZombies])

  const createKitty = useCallback(async () => {
    if (!kittyContract || !account) {
      console.log('No kitty contract or account available:', { kittyContract: !!kittyContract, account })
      return
    }
    try {
      console.log('Starting to create kitty with account:', account)
      const genes = kittyGenes || Math.floor(Math.random() * 10**16).toString()
      console.log('Using genes:', genes)
      
      console.log('Calling createTestKitty...')
      const result = await kittyContract.methods.createTestKitty(genes).send({
        from: account,
        gas: 300000
      })
      console.log('CreateTestKitty transaction result:', result)
      
      alert('Successfully created a new kitty!')
      console.log('Refreshing kitties list...')
      await refreshKitties()
    } catch (err) {
      console.error('Error creating kitty:', err)
      alert('Failed to create kitty. Error: ' + err.message)
    }
  }, [kittyContract, account, kittyGenes, refreshKitties])

  const feedOnKitty = useCallback(async (zombieId) => {
    if (!zombieContract || !kittyContract || !account) {
      console.log('Missing required contracts or account:', { 
        hasZombieContract: !!zombieContract, 
        hasKittyContract: !!kittyContract, 
        account 
      })
      return
    }
    
    try {
      console.log('Starting feedOnKitty. ZombieId:', zombieId)
      
      // First check if there are any kitties available
      if (kitties.length === 0) {
        console.log('No kitties found, prompting to create new')
        const createNew = window.confirm('No kitties found. Would you like to create a new kitty to feed on?')
        if (createNew) {
          await createKitty()
          // Wait a bit for the kitty to be mined and refresh
          await new Promise(resolve => setTimeout(resolve, 2000))
          await refreshKitties()
        } else {
          return
        }
      }

      // Get all kitties owned by anyone (not just the current user)
      let availableKitties = []
      let kittyId = 0
      const MAX_SEARCH = 10 // Limit how many kitties we search for

      console.log('Searching for available kitties...')
      while (kittyId < MAX_SEARCH) {
        try {
          const kitty = await kittyContract.methods.kitties(kittyId).call()
          if (kitty.genes) { // If kitty exists
            availableKitties.push({
              id: kittyId,
              genes: kitty.genes.toString(),
              generation: kitty.generation
            })
          }
        } catch (e) {
          console.log('No more kitties found at ID:', kittyId);
          console.log('Error fetching kitty', kittyId, ':', e.message)
          break // Stop if we hit an error (likely means we've reached the end)
        }
        kittyId++
      }

      console.log('Available kitties:', availableKitties)

      if (availableKitties.length === 0) {
        alert('No kitties found to feed on. Please create some kitties first.')
        return
      }

      // Show available kitties in the prompt
      const kittyOptions = availableKitties
        .map(k => `${k.id} (Genes: ${k.genes})`)
        .join('\n')
      const promptMessage = `Enter kitty ID to feed on:\nAvailable kitties:\n${kittyOptions}`
      const targetKittyId = prompt(promptMessage, availableKitties[0]?.id || '0')
      
      if (!targetKittyId) {
        console.log('User cancelled kitty selection')
        return
      }

      console.log('Validating feeding conditions...')
      
      // Check zombie ownership
      try {
        const zombie = await zombieContract.methods.zombies(zombieId).call()
        const zombieToOwner = await zombieContract.methods.zombieToOwner(zombieId).call()
        console.log('Zombie details:', zombie)
        console.log('Zombie owner:', zombieToOwner)
        
        if (zombieToOwner.toLowerCase() !== account.toLowerCase()) {
          throw new Error('You do not own this zombie')
        }

        // Check cooldown
        const now = Math.floor(Date.now() / 1000)
        if (Number(zombie.readyTime) > now) {
          const waitTime = Math.ceil((Number(zombie.readyTime) - now) / 60)
          throw new Error(`Zombie is not ready to feed. Please wait ${waitTime} minutes.`)
        }
      } catch (error) {
        console.error('Error checking zombie ownership/cooldown:', error)
        alert(error.message || 'Error checking zombie ownership')
        return
      }

      // Check if kitty exists and is valid
      console.log('Checking if kitty exists. ID:', targetKittyId)
      try {
        const kitty = await kittyContract.methods.kitties(targetKittyId).call()
        console.log('Kitty details:', kitty)
        if (!kitty.genes) {
          throw new Error('Kitty does not exist')
        }
      } catch (err) {
        console.error('Error checking kitty:', err)
        alert('Invalid kitty ID. Please make sure the kitty exists.')
        return
      }

      // Convert parameters to the correct type
      const zombieIdNumber = Number(zombieId)
      const targetKittyIdNumber = Number(targetKittyId)
      
      if (isNaN(zombieIdNumber) || isNaN(targetKittyIdNumber)) {
        throw new Error('Invalid ID format: both zombie ID and kitty ID must be numbers')
      }

      console.log('Calling feedOnKitty with params:', { zombieIdNumber, targetKittyIdNumber })
      
      console.log('Preparing to feed zombie...')
      
      // Set a fixed gas limit since we've already validated the conditions
      const tx = await zombieContract.methods.feedOnKitty(zombieIdNumber, targetKittyIdNumber).send({
        from: account,
        gas: 300000
      })
      console.log('FeedOnKitty transaction result:', tx)
      
      alert('Successfully fed your zombie with kitty #' + targetKittyId)
      await refreshZombies()
    } catch (err) {
      console.error('Error feeding on kitty:', err)
      const errorMessage = err.message || 'Unknown error'
      alert('Failed to feed on kitty: ' + errorMessage)
    }
  }, [zombieContract, kittyContract, account, kitties, createKitty, refreshZombies])

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      setAccount(null)
      setError('Please connect your MetaMask wallet')
      setZombies([])
      setKitties([])
    } else if (accounts[0] !== account) {
      setAccount(accounts[0])
      setZombies([])
      setKitties([])
    }
  }, [account])

  const handleChainChanged = useCallback(() => {
    window.location.reload()
  }, [])

  const handleDisconnect = useCallback(() => {
    setError('Please connect your MetaMask wallet')
    setAccount(null)
    setZombies([])
    setKitties([])
  }, [])

  const initWeb3 = useCallback(async () => {
    try {
      setIsInitializing(true)
      setError(null)

      if (!window.ethereum) {
        throw new Error('Please install MetaMask')
      }

      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
      } catch (err) {
        throw new Error('Please connect your MetaMask wallet', err)
      }

      const w3 = new Web3(window.ethereum)
      setWeb3(w3)

      const netId = await w3.eth.net.getId()
      const accounts = await w3.eth.getAccounts()
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your MetaMask wallet')
      }
      
      setAccount(accounts[0])

      // Initialize Zombie contract
      const zombieDeployed = zombieArtifact.networks[netId] || zombieArtifact.networks['5777']
      if (!zombieDeployed) {
        throw new Error('Zombie contract not deployed to detected network')
      }
      const zombieInstance = new w3.eth.Contract(zombieArtifact.abi, zombieDeployed.address)
      setZombieContract(zombieInstance)

      // Initialize Kitty contract
      console.log('Initializing Kitty contract. Network ID:', netId)
      const kittyDeployed = kittyArtifact.networks[netId] || kittyArtifact.networks['5777']
      if (!kittyDeployed) {
        console.error('Kitty contract not found for network:', netId)
        console.log('Available networks:', Object.keys(kittyArtifact.networks))
        throw new Error('Kitty contract not deployed to detected network')
      }
      console.log('Kitty contract address:', kittyDeployed.address)
      const kittyInstance = new w3.eth.Contract(kittyArtifact.abi, kittyDeployed.address)
      console.log('Kitty contract methods:', Object.keys(kittyInstance.methods))
      setKittyContract(kittyInstance)

    } catch (err) {
      console.error('Initialization error:', err)
      setError(err.message)
    } finally {
      setIsInitializing(false)
    }
  }, [])

  useEffect(() => {
    if (!window.ethereum) return

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
    window.ethereum.on('disconnect', handleDisconnect)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
      window.ethereum.removeListener('disconnect', handleDisconnect)
    }
  }, [handleAccountsChanged, handleChainChanged, handleDisconnect])

  useEffect(() => {
    initWeb3()
  }, [initWeb3])

  useEffect(() => {
    if (zombieContract && kittyContract && account) {
      refreshZombies()
      refreshKitties()
    }
  }, [zombieContract, kittyContract, account, refreshZombies, refreshKitties])

  return (
    <div className='App'>
      <h1>CryptoZombies DApp</h1>
      
      {isInitializing ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ padding: 12, border: '1px solid #f5c6cb', background: '#fff0f0', color: '#721c24' }}>
          <strong>Error:</strong> {error}
          <button 
            style={{ marginLeft: 8 }} 
            onClick={initWeb3}
          >
            Retry Connection
          </button>
        </div>
      ) : !account ? (
        <div>
          <p>Please connect your MetaMask wallet to continue</p>
          <button onClick={initWeb3}>Connect Wallet</button>
        </div>
      ) : (
        <div>
          <div>Connected Account: {account}</div>

          {account.toLowerCase() !== DEPLOYER.toLowerCase() && (
            <div style={{ marginTop: 12, padding: 12, border: '1px solid #f5c6cb', background: '#fff0f0', color: '#721c24' }}>
              <strong>Warning:</strong> Your connected MetaMask account does not match the deployer account used for migrations.
              <div style={{ marginTop: 6 }}>
                Deployer address: <code>{DEPLOYER}</code>
                <button style={{ marginLeft: 8 }} onClick={() => navigator.clipboard.writeText(DEPLOYER)}>Copy address</button>
              </div>
              <div style={{ marginTop: 8 }}>
                To fix: switch MetaMask to the deployer account or import the private key from Ganache (Accounts  key icon). After switching, refresh this page.
              </div>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 20 }}>
              <h3>Create Zombie</h3>
              <input 
                placeholder='Zombie name' 
                value={name} 
                onChange={e => setName(e.target.value)}
                style={{ marginRight: 8 }}
              />
              <button onClick={createZombie} style={{ marginRight: 8 }}>Create Random Zombie</button>
              <button onClick={refreshZombies}>Refresh Zombies</button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3>Create Kitty</h3>
              <input 
                placeholder='Kitty genes (optional)' 
                value={kittyGenes} 
                onChange={e => setKittyGenes(e.target.value)}
                style={{ marginRight: 8 }}
              />
              <button onClick={createKitty} style={{ marginRight: 8 }}>Create Test Kitty</button>
              <button onClick={refreshKitties}>Refresh Kitties</button>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <h2>Your Zombies</h2>
            {zombies.length === 0 && <div>No zombies found</div>}
            {zombies.map(z => (
              <div key={z.id} style={{ border: '1px solid #ccc', padding: 8, margin: 8, borderRadius: 4 }}>
                <div>Id: {z.id}</div>
                <div>Name: {z.name}</div>
                <div>DNA: {z.dna}</div>
                <div>Level: {z.level}</div>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => levelUp(z.id)} style={{ marginRight: 8 }}>Level Up (0.001 ETH)</button>
                  <button onClick={() => feedOnKitty(z.id)}>Feed on Kitty</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <h2>Your Kitties</h2>
            {kitties.length === 0 && <div>No kitties found</div>}
            {kitties.map(k => (
                <div key={k.id} style={{ border: '1px solid #ccc', padding: 8, margin: 8, borderRadius: 4 }}>
                <div>Id: {k.id}</div>
                <div>Genes: {k.genes.toString()}</div>
                <div>Generation: {k.generation || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
