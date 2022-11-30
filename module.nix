{ pkgs, config, lib, options, ... }:

let cfg = config.services.twitcher; in
{
  options = {
    services.twitcher = {
      enable = lib.mkEnableOption "ryan's website";
      domain = lib.mkOption {
        type = lib.types.str;
        default = "twitcher.${config.networking.domain}";
      };
      port = lib.mkOption {
        type = lib.types.port;
        default = 8080;
      };
      user = lib.mkOption {
        type = lib.types.str;
        default = "twitcher";
      };
      group = lib.mkOption {
        type = lib.types.str;
        default = cfg.user;
      };
      dotenvFile = lib.mkOption {
        type = lib.types.path;
        default = null;
      };
      cname = lib.mkOption {
        type = lib.types.str;
        default = null;
        description = ''
          CNAME to create DNS records for.
          Ignored if null
        '';
      };
    };
  };

  config = lib.mkIf cfg.enable {
    services.nginx = {
      enable = true;
      recommendedProxySettings = true;
      virtualHosts."${cfg.domain}" = {
        forceSSL = true;
        enableACME = true;
        locations."/" = {
          proxyPass = "http://127.0.0.1:${builtins.toString cfg.port}";
        };
      };
    };

    systemd.services.twitcher = {
      enable = true;
      description = "twitcher";
      after = [ "network.target" ];
      wantedBy = [ "multi-user.target" ];
      environment.PORT = "${builtins.toString cfg.port}";
      preStart = ''
        
        
      '';
      serviceConfig = {
        ExecStart = "${pkgs.nodejs}/bin/node .";
        EnvironmentFile = cfg.dotenvFile;
        WorkingDirectory = "${pkgs.twitcher}/lib/node_modules/twitcher/";

        ### from nginx systemd

        Restart = "always";
        RestartSec = "10s";
        # User and group
        User = cfg.user;
        Group = cfg.group;
        # Runtime directory and mode
        RuntimeDirectory = "twitcher";
        RuntimeDirectoryMode = "0750";
        # Cache directory and mode
        CacheDirectory = "nginx";
        CacheDirectoryMode = "0750";
        # Logs directory and mode
        LogsDirectory = "nginx";
        LogsDirectoryMode = "0750";
        # Proc filesystem
        ProcSubset = "pid";
        ProtectProc = "invisible";
        # New file permissions
        UMask = "0027"; # 0640 / 0750
        # Capabilities
        AmbientCapabilities = [ "CAP_NET_BIND_SERVICE" "CAP_SYS_RESOURCE" ];
        CapabilityBoundingSet = [ "CAP_NET_BIND_SERVICE" "CAP_SYS_RESOURCE" ];
         # Security
        NoNewPrivileges = true;
        # Sandboxing (sorted by occurrence in https://www.freedesktop.org/software/systemd/man/systemd.exec.html)
        ProtectSystem = "strict";
        ProtectHome = true;
        PrivateTmp = true;
        PrivateDevices = true;
        ProtectHostname = true;
        ProtectClock = true;
        ProtectKernelTunables = true;
        ProtectKernelModules = true;
        ProtectKernelLogs = true;
        ProtectControlGroups = true;
        RestrictAddressFamilies = [ "AF_UNIX" "AF_INET" "AF_INET6" ];
        RestrictNamespaces = true;
        LockPersonality = true;
        MemoryDenyWriteExecute = true;
        RestrictRealtime = true;
        RestrictSUIDSGID = true;
        RemoveIPC = true;
        PrivateMounts = true;
        # System Call Filtering
        SystemCallArchitectures = "native";
        SystemCallFilter = [ "~@cpu-emulation @debug @keyring @mount @obsolete @privileged @setuid" ];
      };
    };

    # requires dns module
    hosting.dns.records = [
      {
        name = "${cfg.domain}.";
        type = "CNAME";
        data = cfg.cname;
      }
      {
        name = "www.${cfg.domain}.";
        type = "CNAME";
        data = cfg.cname;
      }
    ];
  };
}
