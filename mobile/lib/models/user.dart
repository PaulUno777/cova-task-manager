class User {
  final int id;
  final String email;
  final DateTime createdAt;

  const User({required this.id, required this.email, required this.createdAt});

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'] as int,
    email: json['email'] as String,
    createdAt: DateTime.parse(json['createdAt'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'createdAt': createdAt.toIso8601String(),
  };
}
