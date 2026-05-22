using UnityEngine;

namespace MarketSwarm
{
    [RequireComponent(typeof(Rigidbody2D))]
    public sealed class PlayerController : MonoBehaviour
    {
        [SerializeField] private SpriteRenderer spriteRenderer;
        [SerializeField] private Animator animator;
        [SerializeField] private AttackVfx attackVfx;
        [SerializeField] private LayerMask enemyLayer;

        private CharacterDefinition definition;
        private Rigidbody2D rb;
        private Vector2 movement;
        private Vector2 facing = Vector2.down;
        private float attackCooldownRemaining;

        public float Health { get; private set; }
        public float Stamina { get; private set; }
        public float MaxHealth => definition.maxHealth;
        public float MaxStamina => definition.maxStamina;

        private void Awake()
        {
            rb = GetComponent<Rigidbody2D>();
            rb.gravityScale = 0f;
            rb.freezeRotation = true;
        }

        public void Initialize(CharacterDefinition characterDefinition)
        {
            definition = characterDefinition;
            Health = definition.maxHealth;
            Stamina = definition.maxStamina;

            if (animator != null)
            {
                animator.runtimeAnimatorController = definition.animatorController;
            }
        }

        private void Update()
        {
            if (definition == null || GameManager.Instance.State != GameState.Playing)
            {
                movement = Vector2.zero;
                return;
            }

            movement = new Vector2(Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical"));
            if (movement.sqrMagnitude > 1f)
            {
                movement.Normalize();
            }

            if (movement.sqrMagnitude > 0.001f)
            {
                facing = movement;
            }

            attackCooldownRemaining = Mathf.Max(0f, attackCooldownRemaining - Time.deltaTime);
            Stamina = Mathf.Min(definition.maxStamina, Stamina + definition.staminaRegenPerSecond * Time.deltaTime);

            if (Input.GetKeyDown(KeyCode.Space))
            {
                TryAttack();
            }

            UpdateAnimator();
        }

        private void FixedUpdate()
        {
            if (definition == null)
            {
                return;
            }

            rb.MovePosition(rb.position + movement * definition.moveSpeed * Time.fixedDeltaTime);
        }

        private void TryAttack()
        {
            if (attackCooldownRemaining > 0f || Stamina < definition.staminaCost)
            {
                return;
            }

            attackCooldownRemaining = definition.attackCooldown;
            Stamina -= definition.staminaCost;

            if (attackVfx != null)
            {
                attackVfx.Play(transform.position, definition.attackRadius, definition.attackColor);
            }

            Collider2D[] hits = Physics2D.OverlapCircleAll(transform.position, definition.attackRadius, enemyLayer);
            for (int i = 0; i < hits.Length; i++)
            {
                if (hits[i].TryGetComponent(out EnemyController enemy))
                {
                    enemy.Die();
                }
            }
        }

        public void TakeDamage(float amount)
        {
            Health = Mathf.Max(0f, Health - amount);
            if (Health <= 0f)
            {
                GameManager.Instance.EndGame(false);
            }
        }

        private void UpdateAnimator()
        {
            if (animator == null)
            {
                return;
            }

            animator.SetFloat("MoveX", facing.x);
            animator.SetFloat("MoveY", facing.y);
            animator.SetFloat("Speed", movement.sqrMagnitude);
        }

        private void OnDrawGizmosSelected()
        {
            if (definition == null)
            {
                return;
            }

            Gizmos.color = Color.magenta;
            Gizmos.DrawWireSphere(transform.position, definition.attackRadius);
        }
    }
}
