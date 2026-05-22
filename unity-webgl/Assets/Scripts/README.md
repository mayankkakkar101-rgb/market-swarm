# Scripts

These scripts implement the Unity version of the current Market Swarm prototype.

Core runtime:

- `GameManager.cs`: state machine, timer, character select, game over
- `PlayerController.cs`: movement, stamina, AoE attack
- `EnemyController.cs`: pursuit AI and collision damage
- `EnemySpawner.cs`: off-screen swarm spawning with increasing pressure
- `HUDController.cs`: timer, kills, selected character status
- `CharacterSelectUI.cs`: PM/PAPPU buttons
- `AttackVfx.cs`: soft AoE feedback
- `IsometricDepthSorter.cs`: 2D sorting by Y position
- `CameraFitArena.cs`: fits orthographic camera to arena

