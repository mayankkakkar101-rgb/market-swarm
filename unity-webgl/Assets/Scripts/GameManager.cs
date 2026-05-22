using System;
using UnityEngine;

namespace MarketSwarm
{
    public sealed class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Core")]
        [SerializeField] private float roundDurationSeconds = 60f;
        [SerializeField] private PlayerController playerPrefab;
        [SerializeField] private Transform playerSpawn;
        [SerializeField] private EnemySpawner enemySpawner;
        [SerializeField] private HUDController hud;
        [SerializeField] private CharacterSelectUI characterSelectUI;
        [SerializeField] private GameObject gameOverPanel;

        [Header("Characters")]
        [SerializeField] private CharacterDefinition mitroooCharacter;
        [SerializeField] private CharacterDefinition pappuCharacter;

        public GameState State { get; private set; } = GameState.CharacterSelect;
        public CharacterDefinition SelectedCharacter { get; private set; }
        public PlayerController Player { get; private set; }
        public int KillCount { get; private set; }
        public float TimeRemaining { get; private set; }

        public event Action OnSnapshotChanged;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
        }

        private void Start()
        {
            ShowCharacterSelect();
        }

        private void Update()
        {
            if (State != GameState.Playing)
            {
                return;
            }

            TimeRemaining -= Time.deltaTime;
            if (TimeRemaining <= 0f)
            {
                TimeRemaining = 0f;
                EndGame(true);
            }

            OnSnapshotChanged?.Invoke();
        }

        public CharacterDefinition GetDefinition(CharacterId id)
        {
            return id == CharacterId.Mitrooo ? mitroooCharacter : pappuCharacter;
        }

        public void SelectCharacter(CharacterId id)
        {
            SelectedCharacter = GetDefinition(id);
            StartRound();
        }

        private void StartRound()
        {
            State = GameState.Playing;
            KillCount = 0;
            TimeRemaining = roundDurationSeconds;

            characterSelectUI.gameObject.SetActive(false);
            if (gameOverPanel != null)
            {
                gameOverPanel.SetActive(false);
            }

            if (Player != null)
            {
                Destroy(Player.gameObject);
            }

            Player = Instantiate(playerPrefab, playerSpawn.position, Quaternion.identity);
            Player.Initialize(SelectedCharacter);

            enemySpawner.Begin(Player);
            hud.Bind(this);
            OnSnapshotChanged?.Invoke();
        }

        public void AddKill()
        {
            KillCount += 1;
            OnSnapshotChanged?.Invoke();
        }

        public void EndGame(bool won)
        {
            if (State != GameState.Playing)
            {
                return;
            }

            State = GameState.GameOver;
            enemySpawner.StopAndClear();

            if (gameOverPanel != null)
            {
                gameOverPanel.SetActive(true);
            }

            OnSnapshotChanged?.Invoke();
        }

        public void ShowCharacterSelect()
        {
            State = GameState.CharacterSelect;
            TimeRemaining = roundDurationSeconds;
            KillCount = 0;

            if (Player != null)
            {
                Destroy(Player.gameObject);
            }

            enemySpawner.StopAndClear();
            characterSelectUI.gameObject.SetActive(true);
            characterSelectUI.Bind(this);

            if (gameOverPanel != null)
            {
                gameOverPanel.SetActive(false);
            }

            OnSnapshotChanged?.Invoke();
        }
    }
}
