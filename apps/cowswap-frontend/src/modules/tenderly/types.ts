import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface GetTokenBalanceSlotParams {
  tokenAddress: string
  chainId: SupportedChainId
}

export interface StoreTokenBalanceSlotParams extends GetTokenBalanceSlotParams {
  memorySlot: string
}

export interface TenderlyEncodeStatesResponse {
  stateOverrides: Record<string, { value: Record<string, string> }>
}

export interface TenderlyEncodeStatesPayload extends TenderlyEncodeStatesResponse {
  networkID: string
}

export interface TenderlyBundleSimulationResponse {
  simulation_results: TenderlySimulation[]
}

// types were found in Uniswap repository
// https://github.com/Uniswap/governance-seatbelt/blob/e2c6a0b11d1660f3bd934dab0d9df3ca6f90a1a0/types.d.ts#L123

type StateObject = {
  balance?: string
  code?: string
  storage?: Record<string, string>
}

type ContractObject = {
  contractName: string
  source: string
  sourcePath: string
  compiler: {
    name: 'solc'
    version: string
  }
  networks: Record<
    string,
    {
      events?: Record<string, string>
      links?: Record<string, string>
      address: string
      transactionHash?: string
    }
  >
}

export type TenderlySimulatePayload = {
  network_id: string
  block_number?: number
  transaction_index?: number
  from: string
  to: string
  input: string
  gas: number
  gas_price?: string
  value?: string
  simulation_type?: 'full' | 'quick'
  save?: boolean
  save_if_fails?: boolean
  state_objects?: Record<string, StateObject>
  contracts?: ContractObject[]
  block_header?: {
    number?: string
    timestamp?: string
  }
  generate_access_list?: boolean
}

// --- Tenderly types, Response ---
// NOTE: These type definitions were autogenerated using https://app.quicktype.io/, so are almost
// certainly not entirely accurate (and they have some interesting type names)

export interface TenderlySimulation {
  transaction: Transaction
  simulation: Simulation
  contracts: TenderlyContract[]
  generated_access_list: GeneratedAccessList[]
}

interface TenderlyContract {
  id: string
  contract_id: string
  balance: string
  network_id: string
  public: boolean
  export: boolean
  verified_by: string
  verification_date: null
  address: string
  contract_name: string
  ens_domain: null
  type: string
  evm_version: string
  compiler_version: string
  optimizations_used: boolean
  optimization_runs: number
  libraries: null
  data: Data
  creation_block: number
  creation_tx: string
  creator_address: string
  created_at: Date
  number_of_watches: null
  language: string
  in_project: boolean
  number_of_files: number
  standard?: string
  standards?: string[]
  token_data?: TokenData
}

interface Data {
  main_contract: number
  contract_info: ContractInfo[]
  abi: ABI[]
  raw_abi: null
}

interface ABI {
  type: ABIType
  name: string
  constant: boolean
  anonymous: boolean
  inputs: SoltypeElement[]
  outputs: Output[] | null
}

interface SoltypeElement {
  name: string
  type: SoltypeType
  storage_location: StorageLocation
  components: SoltypeElement[] | null
  offset: number
  index: string
  indexed: boolean
  simple_type?: Type
}

interface Type {
  type: SimpleTypeType
}

enum SimpleTypeType {
  Address = 'address',
  Bool = 'bool',
  Bytes = 'bytes',
  Slice = 'slice',
  String = 'string',
  Uint = 'uint',
}

enum StorageLocation {
  Calldata = 'calldata',
  Default = 'default',
  Memory = 'memory',
  Storage = 'storage',
}

enum SoltypeType {
  Address = 'address',
  Bool = 'bool',
  Bytes32 = 'bytes32',
  MappingAddressUint256 = 'mapping (address => uint256)',
  MappingUint256Uint256 = 'mapping (uint256 => uint256)',
  String = 'string',
  Tuple = 'tuple',
  TypeAddress = 'address[]',
  TypeTuple = 'tuple[]',
  Uint16 = 'uint16',
  Uint256 = 'uint256',
  Uint48 = 'uint48',
  Uint56 = 'uint56',
  Uint8 = 'uint8',
}

interface Output {
  name: string
  type: SoltypeType
  storage_location: StorageLocation
  components: SoltypeElement[] | null
  offset: number
  index: string
  indexed: boolean
  simple_type?: SimpleType
}

interface SimpleType {
  type: SimpleTypeType
  nested_type?: Type
}

enum ABIType {
  Constructor = 'constructor',
  Event = 'event',
  Function = 'function',
}

interface ContractInfo {
  id: number
  path: string
  name: string
  source: string
}

interface TokenData {
  symbol: string
  name: string
  decimals: number
}

interface GeneratedAccessList {
  address: string
  storage_keys: string[]
}

interface Simulation {
  id: string
  project_id: string
  owner_id: string
  network_id: string
  block_number: number
  transaction_index: number
  from: string
  to: string
  input: string
  gas: number
  gas_price: string
  value: string
  method: string
  status: boolean
  access_list: null
  queue_origin: string
  created_at: Date
}

interface ErrorInfo {
  error_message: string
  address: string
}

export interface SimulationError {
  error: {
    id: string
    message: string
    slug: string
  }
}

interface Transaction {
  hash: string
  block_hash: string
  block_number: number
  from: string
  gas: number
  gas_price: number
  gas_fee_cap: number
  gas_tip_cap: number
  cumulative_gas_used: number
  gas_used: number
  effective_gas_price: number
  input: string
  nonce: number
  to: string
  index: number
  error_message?: string
  error_info?: ErrorInfo
  value: string
  access_list: null
  status: boolean
  addresses: string[]
  contract_ids: string[]
  network_id: string
  function_selector: string
  transaction_info: TransactionInfo
  timestamp: Date
  method: string
  decoded_input: null
  // Note: manually added (partial keys of `call_trace`)
  call_trace: Array<{
    error?: string
    input: string
  }>
}

interface TransactionInfo {
  contract_id: string
  block_number: number
  transaction_id: string
  contract_address: string
  method: string
  parameters: null
  intrinsic_gas: number
  refund_gas: number
  call_trace: CallTrace
  stack_trace: null | StackTrace[]
  logs: Log[] | null
  state_diff: StateDiff[]
  raw_state_diff: null
  console_logs: null
  created_at: Date
}

interface StackTrace {
  file_index: number
  contract: string
  name: string
  line: number
  error: string
  error_reason: string
  code: string
  op: string
  length: number
}

interface CallTrace {
  hash: string
  contract_name: string
  function_name: string
  function_pc: number
  function_op: string
  function_file_index: number
  function_code_start: number
  function_line_number: number
  function_code_length: number
  function_states: CallTraceFunctionState[]
  caller_pc: number
  caller_op: string
  call_type: string
  from: string
  from_balance: string
  to: string
  to_balance: string
  value: string
  caller: Caller
  block_timestamp: Date
  gas: number
  gas_used: number
  intrinsic_gas: number
  input: string
  decoded_input: Input[]
  state_diff: StateDiff[]
  logs: Log[]
  output: string
  decoded_output: FunctionVariableElement[]
  network_id: string
  calls: CallTraceCall[]
}

interface Caller {
  address: string
  balance: string
}

interface CallTraceCall {
  hash: string
  contract_name: string
  function_name: string
  function_pc: number
  function_op: string
  function_file_index: number
  function_code_start: number
  function_line_number: number
  function_code_length: number
  function_states: CallTraceFunctionState[]
  function_variables: FunctionVariableElement[]
  caller_pc: number
  caller_op: string
  caller_file_index: number
  caller_line_number: number
  caller_code_start: number
  caller_code_length: number
  call_type: string
  from: string
  from_balance: null
  to: string
  to_balance: null
  value: null
  caller: Caller
  block_timestamp: Date
  gas: number
  gas_used: number
  input: string
  decoded_input: Input[]
  output: string
  decoded_output: FunctionVariableElement[]
  network_id: string
  calls: PurpleCall[]
}

interface PurpleCall {
  hash: string
  contract_name: string
  function_name: string
  function_pc: number
  function_op: string
  function_file_index: number
  function_code_start: number
  function_line_number: number
  function_code_length: number
  function_states?: FluffyFunctionState[]
  function_variables?: FunctionVariable[]
  caller_pc: number
  caller_op: string
  caller_file_index: number
  caller_line_number: number
  caller_code_start: number
  caller_code_length: number
  call_type: string
  from: string
  from_balance: null | string
  to: string
  to_balance: null | string
  value: null | string
  caller: Caller
  block_timestamp: Date
  gas: number
  gas_used: number
  refund_gas?: number
  input: string
  decoded_input: Input[]
  output: string
  decoded_output: FunctionVariable[] | null
  network_id: string
  calls: FluffyCall[] | null
}

interface FluffyCall {
  hash: string
  contract_name: string
  function_name?: string
  function_pc: number
  function_op: string
  function_file_index?: number
  function_code_start?: number
  function_line_number?: number
  function_code_length?: number
  function_states?: FluffyFunctionState[]
  function_variables?: FunctionVariable[]
  caller_pc: number
  caller_op: string
  caller_file_index: number
  caller_line_number: number
  caller_code_start: number
  caller_code_length: number
  call_type: string
  from: string
  from_balance: null | string
  to: string
  to_balance: null | string
  value: null | string
  caller?: Caller
  block_timestamp: Date
  gas: number
  gas_used: number
  input: string
  decoded_input?: FunctionVariable[]
  output: string
  decoded_output: PurpleDecodedOutput[] | null
  network_id: string
  calls: TentacledCall[] | null
  refund_gas?: number
}

interface TentacledCall {
  hash: string
  contract_name: string
  function_name: string
  function_pc: number
  function_op: string
  function_file_index: number
  function_code_start: number
  function_line_number: number
  function_code_length: number
  function_states: PurpleFunctionState[]
  caller_pc: number
  caller_op: string
  caller_file_index: number
  caller_line_number: number
  caller_code_start: number
  caller_code_length: number
  call_type: string
  from: string
  from_balance: null
  to: string
  to_balance: null
  value: null
  caller: Caller
  block_timestamp: Date
  gas: number
  gas_used: number
  input: string
  decoded_input: FunctionVariableElement[]
  output: string
  decoded_output: FunctionVariable[]
  network_id: string
  calls: null
}

interface FunctionVariableElement {
  soltype: SoltypeElement
  value: string
}

interface FunctionVariable {
  soltype: SoltypeElement
  value: PurpleValue | string
}

interface PurpleValue {
  ballot: string
  basedOn: string
  configured: string
  currency: string
  cycleLimit: string
  discountRate: string
  duration: string
  fee: string
  id: string
  metadata: string
  number: string
  projectId: string
  start: string
  tapped: string
  target: string
  weight: string
}

interface PurpleFunctionState {
  soltype: SoltypeElement
  value: Record<string, string>
}

interface PurpleDecodedOutput {
  soltype: SoltypeElement
  value: boolean | PurpleValue | string
}

interface FluffyFunctionState {
  soltype: PurpleSoltype
  value: Record<string, string>
}

interface PurpleSoltype {
  name: string
  type: SoltypeType
  storage_location: StorageLocation
  components: null
  offset: number
  index: string
  indexed: boolean
}

interface Input {
  soltype: SoltypeElement | null
  value: boolean | string
}

interface CallTraceFunctionState {
  soltype: PurpleSoltype
  value: Record<string, string>
}

interface Log {
  name: string | null
  anonymous: boolean
  inputs: Input[]
  raw: LogRaw
}

interface LogRaw {
  address: string
  topics: string[]
  data: string
}

interface StateDiff {
  soltype: SoltypeElement | null
  original: string | Record<string, any>
  dirty: string | Record<string, any>
  raw: RawElement[]
}

interface RawElement {
  address: string
  key: string
  original: string
  dirty: string
}
