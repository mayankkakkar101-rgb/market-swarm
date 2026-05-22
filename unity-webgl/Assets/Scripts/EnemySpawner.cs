using System.Collections.Generic;
using UnityEngine;

namespace MarketSwarm
{
    public sealed class EnemySpawner : MonoBehaviour
    {
        [SerializeField] private EnemyController enemyPrefab;
        [SerializeField] private BoxCollider2D arenaBounds;
        [SerializeField] private float baseSpawnInterval = 1.35f;
        [SerializeField] private float minSpawnInterval = 0.22f;
        [SerializeField] private float spawnPadding = 1.5f;

        private readonly List<EnemyController> activeEnemies = new();
        private PlayerController player;
        private float spawnTimer;
        private bool running;

        public void Begin(PlayerController playerController)
        {
            StopAndClear();
            player = playerController;
            running = true;
            spawnTimer = 0.2f;
        }

        public void StopAndClear()
        {
            running = false;
            player = null;

            for (int i = activeEnemies.Count - 1; i >= 0; i--)
            {
                if (activeEnemies[i] != null)
                {
                    Destroy(activeEnemies[i].gameObject);
                }
            }

            activeEnemies.Clear();
        }

        private void Update()
        {
            if (!running || player == null || GameManager.Instance.State != GameState.Playing)
            {
                return;
            }

            spawnTimer -= Time.deltaTime;
            if (spawnTimer <= 0f)
            {
                Spawn();
                spawnTimer = CurrentSpawnInterval();
            }
        }

        private float CurrentSpawnInterval()
        {
            float progress = 1f - (GameManager.Instance.TimeRemaining / 60f);
            return Mathf.Lerp(baseSpawnInterval, minSpawnInterval, progress);
        }

        private void Spawn()
        {
            Bounds b = arenaBounds.bounds;
            Vector2 pos = RandomSpawnPoint(b);
            EnemyController enemy = Instantiate(enemyPrefab, pos, Quaternion.identity);
            enemy.Initialize(player, Random.value < 0.08f);
            activeEnemies.Add(enemy);
        }

        private Vector2 RandomSpawnPoint(Bounds b)
        {
            int side = Random.Range(0, 4);
            return side switch
            {
                0 => new Vector2(Random.Range(b.min.x, b.max.x), b.max.y + spawnPadding),
                1 => new Vector2(b.max.x + spawnPadding, Random.Range(b.min.y, b.max.y)),
                2 => new Vector2(Random.Range(b.min.x, b.max.x), b.min.y - spawnPadding),
                _ => new Vector2(b.min.x - spawnPadding, Random.Range(b.min.y, b.max.y)),
            };
        }
    }
}
