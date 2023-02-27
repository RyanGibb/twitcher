{
  description = "A tweet guessing game";

  outputs = { self, nixpkgs, flake-utils, ... }:
    (flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          nodejs = pkgs."nodejs-14_x";
          nodeEnv = import ./node-env-nix {
            inherit (pkgs) stdenv lib python2 runCommand writeTextFile writeShellScript;
            inherit pkgs nodejs;
            libtool = if pkgs.stdenv.isDarwin then pkgs.darwin.cctools else null;
          };
          node-packages = import ./node-packages-nix {
            inherit (pkgs) fetchurl nix-gitignore stdenv lib fetchgit;
            inherit nodeEnv;
          };
        in {
          packages.default = node-packages.package;

          defaultPackage = self.packages.${system}.default;
          
          devShells.default = pkgs.mkShell {
            buildInputs = [ nodejs ];
          };
        }
      )
    ) // {
      nixosModules.default = {
        imports = [ ./module.nix ];
      };

      nixosConfigurations."container" = nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        modules = [
          ({ pkgs, ... }: {
            boot.isContainer = true;
            system.configurationRevision = nixpkgs.lib.mkIf (self ? rev) self.rev;
            networking.useDHCP = false;
            networking.firewall.allowedTCPPorts = [ 80 ];
            services.nginx = {
              enable = true;
              virtualHosts."_" = {
                locations."/" = {
                   proxyPass = "http://127.0.0.1:8080";
                 };
              };
            };
            systemd.services.twitcher = {
              enable = true;
              description = "twitcher";
              serviceConfig = {
                ExecStart = "${pkgs.nodejs}/bin/node .";
                WorkingDirectory = "${self.packages."x86_64-linux".default}/lib/node_modules/twitcher/";
              };
              after = [ "network.target" ];
              wantedBy = [ "multi-user.target" ];
              environment.PORT = "8080";
            };
            system.stateVersion = "22.11";
          })
          ./module.nix
        ];
      };
    };
}
